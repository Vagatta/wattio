<?php
declare(strict_types=1);

// Wattio — recepción de facturas en hosting compartido (PHP).
// Recibe multipart/form-data y lo reenvía por email a través de la API REST de Resend.
// Los secretos viven en wattio-secrets.php FUERA del webroot o en variables de entorno.

header('Content-Type: application/json; charset=utf-8');

function respond(array $body, int $status = 200): void {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(['error' => 'Método no permitido.'], 405);
}

$secretsFile = dirname(__DIR__, 2) . '/wattio-secrets.php';
if (is_file($secretsFile)) {
    require $secretsFile;
}
$apiKey = getenv('RESEND_API_KEY') ?: ($RESEND_API_KEY ?? '');
$from = getenv('RESEND_FROM_EMAIL') ?: ($RESEND_FROM_EMAIL ?? '');
$copyList = array_values(array_filter(array_map('trim', explode(',', (string) (getenv('WATTIO_COPY_EMAILS') ?: ($WATTIO_COPY_EMAILS ?? ''))))));
$ownerEmail = getenv('WATTIO_OWNER_EMAIL') ?: ($WATTIO_OWNER_EMAIL ?? '');

if ($apiKey === '' || $from === '' || $ownerEmail === '') {
    respond(['error' => 'El servicio de envío aún no está configurado.'], 503);
}

// Honeypot: los bots rellenan el campo invisible "company". Se simula éxito.
if (trim((string) ($_POST['company'] ?? '')) !== '') {
    respond(['ok' => true]);
}

// Límite sencillo por IP: 8 envíos por hora.
$ip = preg_replace('/[^a-zA-Z0-9_.:-]/', '_', (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
$rateDir = sys_get_temp_dir() . '/wattio-rate';
if (!is_dir($rateDir)) {
    @mkdir($rateDir, 0700, true);
}
$rateFile = $rateDir . '/' . $ip;
$window = 3600;
$attempts = is_file($rateFile) ? array_map('intval', file($rateFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: []) : [];
$attempts = array_values(array_filter($attempts, fn(int $t) => $t > time() - $window));
if (count($attempts) >= 8) {
    respond(['error' => 'Demasiados envíos seguidos. Inténtalo de nuevo más tarde.'], 429);
}
$attempts[] = time();
@file_put_contents($rateFile, implode("\n", $attempts) . "\n", LOCK_EX);

$email = strtolower(trim((string) ($_POST['email'] ?? '')));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(['error' => 'Introduce un email válido para poder contactarte.'], 422);
}

$files = $_FILES['invoice'] ?? null;
$names = is_array($files['name'] ?? null) ? $files['name'] : [];
if (!$names) {
    respond(['error' => 'Selecciona al menos una factura en PDF, JPG o PNG.'], 422);
}
if (count($names) > 10) {
    respond(['error' => 'Puedes enviar hasta 10 archivos.'], 422);
}

$allowedMime = ['application/pdf', 'image/jpeg', 'image/png'];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$attachments = [];
$totalSize = 0;

foreach ($names as $i => $name) {
    $tmp = $files['tmp_name'][$i] ?? '';
    $size = (int) ($files['size'][$i] ?? 0);
    $error = (int) ($files['error'][$i] ?? UPLOAD_ERR_NO_FILE);
    $totalSize += $size;

    if ($error !== UPLOAD_ERR_OK || $size === 0 || !is_uploaded_file($tmp)) {
        respond(['error' => '«' . $name . '» no es un PDF, JPG o PNG válido o está vacío.'], 422);
    }
    $mime = $finfo->file($tmp) ?: '';
    if (!in_array($mime, $allowedMime, true) || !preg_match('/\.(pdf|jpe?g|png)$/i', (string) $name)) {
        respond(['error' => '«' . $name . '» no es un PDF, JPG o PNG válido o está vacío.'], 422);
    }
    if ($totalSize > 4 * 1024 * 1024) {
        respond(['error' => 'El tamaño total de las facturas no puede superar los 4 MB.'], 422);
    }
    $safeName = substr(preg_replace('/[^a-zA-Z0-9._-]/', '_', (string) $name), -120);
    $attachments[] = [
        'filename' => $safeName,
        'content' => base64_encode((string) file_get_contents($tmp)),
    ];
}

$count = count($attachments);
$payload = [
    'from' => $from,
    'to' => [$ownerEmail],
    'reply_to' => [$email],
    'subject' => 'Nueva factura Wattio — ' . $email,
    'text' => "El usuario {$email} ha enviado {$count} factura" . ($count === 1 ? '' : 's') . ' para revisión. Se adjuntan a este email.',
    'html' => '<p>El usuario <strong>' . htmlspecialchars($email, ENT_QUOTES) . '</strong> ha enviado ' . $count . ' factura' . ($count === 1 ? '' : 's') . ' para revisión.</p><p>Se adjuntan todos los archivos a este email.</p>',
    'attachments' => $attachments,
];
if ($copyList) {
    $payload['bcc'] = $copyList;
}

$ch = curl_init('https://api.resend.com/emails');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 25,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
]);
$result = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($result === false || $status >= 400) {
    $requestId = bin2hex(random_bytes(8));
    error_log('Wattio Resend failure ' . $requestId . ': HTTP ' . $status . ' ' . $curlError . ' ' . (string) $result);
    respond(['error' => 'No se pudo enviar la factura. Inténtalo de nuevo o escríbenos por WhatsApp.', 'requestId' => $requestId], 502);
}

respond(['ok' => true]);
