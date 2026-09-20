# Dot-source this script in the PowerShell session that will later launch the app.
# Masked local entry only: never pass the credential as a command-line argument.
$openAISecret = Read-Host 'OPENAI_API_KEY (masked local entry)' -AsSecureString
$openAIPointer = [IntPtr]::Zero
try {
    $openAIPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($openAISecret)
    $env:OPENAI_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($openAIPointer)
    if ([string]::IsNullOrWhiteSpace($env:OPENAI_API_KEY)) { throw 'OPENAI_API_KEY_EMPTY' }
    Write-Output 'OPENAI_API_KEY is set for this process session. No provider was called.'
} finally {
    if ($openAIPointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($openAIPointer) }
    $openAISecret.Dispose()
    Remove-Variable openAISecret,openAIPointer -ErrorAction SilentlyContinue
}
