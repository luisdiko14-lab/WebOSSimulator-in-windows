# windows.ps1 - Windows Setup & Desktop GUI Simulation
# Saves user data to temp file: $env:TEMP\windows_user_sim.json

# Relaunch in STA mode if necessary (to avoid Windows Forms threading errors)
if ([System.Threading.Thread]::CurrentThread.GetApartmentState().ToString() -ne "STA") {
    $psExe = (Get-Command pwsh -ErrorAction SilentlyContinue) ? "pwsh" : "powershell"
    $script = $MyInvocation.MyCommand.Definition
    $argList = "-NoProfile -STA -File `"$script`""
    Start-Process -FilePath $psExe -ArgumentList $argList -WindowStyle Normal
    exit
}

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

[System.Windows.Forms.Application]::EnableVisualStyles()

# ---------- Helper Functions ----------
function Save-UserData($data) {
    $path = Join-Path $env:TEMP 'windows_user_sim.json'
    $json = $data | ConvertTo-Json -Depth 5
    Set-Content -Path $path -Value $json -Encoding UTF8
}
function Load-UserData {
    $path = Join-Path $env:TEMP 'windows_user_sim.json'
    if (Test-Path $path) { return (Get-Content $path -Raw | ConvertFrom-Json) }
    return $null
}
function Format-TimeNow12 {
    return (Get-Date).ToString("h:mm tt")
}
function Format-DateNow {
    return (Get-Date).ToString("M/d/yyyy")
}

# ---------- Global state ----------
$userData = @{
    username = "User"
    password = ""
    email = ""
    accountType = "local"
    selectedDrive = -1
    wifiNetwork = ""
}

# Load previously saved if exists
$prev = Load-UserData
if ($prev) {
    foreach ($k in $prev.PSObject.Properties.Name) { $userData[$k] = $prev.$k }
}

# ---------- Main Form ----------
$form = New-Object System.Windows.Forms.Form
$form.Text = "Windows Setup & Simulation"
$form.Size = New-Object System.Drawing.Size(1000,680)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = 'FixedSingle'
$form.MaximizeBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(30,30,30)

# ---------- Common Styles ----------
$lblFont = New-Object System.Drawing.Font("Segoe UI",14,[System.Drawing.FontStyle]::Regular)
$bigFont = New-Object System.Drawing.Font("Segoe UI",20,[System.Drawing.FontStyle]::Bold)
$mono = New-Object System.Drawing.Font("Consolas",10)

# ---------- Panels (screens) ----------
function New-Panel {
    param($name)
    $p = New-Object System.Windows.Forms.Panel
    $p.Name = $name
    $p.Size = New-Object System.Drawing.Size(960,560)
    $p.Location = New-Object System.Drawing.Point(15,15)
    $p.BackColor = [System.Drawing.Color]::FromArgb(40,40,40)
    $p.Visible = $false
    $form.Controls.Add($p)
    return $p
}

$panelWelcome = New-Panel -name "panelWelcome"
$panelRegion  = New-Panel -name "panelRegion"
$panelKeyboard = New-Panel -name "panelKeyboard"
$panelDrive = New-Panel -name "panelDrive"
$panelInstalling = New-Panel -name "panelInstalling"
$panelWifi = New-Panel -name "panelWifi"
$panelWifiPass = New-Panel -name "panelWifiPass"
$panelAccountType = New-Panel -name "panelAccountType"
$panelMicrosoftAccount = New-Panel -name "panelMicrosoftAccount"
$panelLocalAccount = New-Panel -name "panelLocalAccount"
$panelPrivacy = New-Panel -name "panelPrivacy"
$panelFinalizing = New-Panel -name "panelFinalizing"
$panelBoot = New-Panel -name "panelBoot"
$panelLock = New-Panel -name "panelLock"
$panelLogin = New-Panel -name "panelLogin"
$panelDesktop = New-Panel -name "panelDesktop"
$panelShutdown = New-Panel -name "panelShutdown"

# ---------- Utility to clear a panel ----------
function Clear-Panel($p) {
    $p.Controls.Clear()
}

# ---------- Welcome ----------
$lbl = New-Object System.Windows.Forms.Label
$lbl.Text = "Welcome to Windows Setup (Simulation)"
$lbl.Font = $bigFont
$lbl.ForeColor = [System.Drawing.Color]::White
$lbl.AutoSize = $true
$lbl.Location = New-Object System.Drawing.Point(40,40)
$panelWelcome.Controls.Add($lbl)

$btnStart = New-Object System.Windows.Forms.Button
$btnStart.Text = "Start Setup"
$btnStart.Size = New-Object System.Drawing.Size(160,40)
$btnStart.Location = New-Object System.Drawing.Point(40,120)
$btnStart.Font = $lblFont
$panelWelcome.Controls.Add($btnStart)

# ---------- Region Selection ----------
$lblR = New-Object System.Windows.Forms.Label
$lblR.Text = "Let's start with region. Is this right?"
$lblR.Font = $lblFont
$lblR.ForeColor = [System.Drawing.Color]::White
$lblR.AutoSize = $true
$lblR.Location = New-Object System.Drawing.Point(30,20)
$panelRegion.Controls.Add($lblR)

$listRegions = New-Object System.Windows.Forms.ListBox
$listRegions.Font = New-Object System.Drawing.Font("Segoe UI",12)
$listRegions.Size = New-Object System.Drawing.Size(380,280)
$listRegions.Location = New-Object System.Drawing.Point(30,60)
$listRegions.Items.AddRange(@("United States","United Kingdom","Canada","Australia","Germany","France"))
$listRegions.SelectedIndex = 0
$panelRegion.Controls.Add($listRegions)

$btnRegionNext = New-Object System.Windows.Forms.Button
$btnRegionNext.Text = "Yes"
$btnRegionNext.Size = New-Object System.Drawing.Size(120,36)
$btnRegionNext.Location = New-Object System.Drawing.Point(30,360)
$btnRegionNext.Font = $lblFont
$panelRegion.Controls.Add($btnRegionNext)

# ---------- Keyboard ----------
$lblK = New-Object System.Windows.Forms.Label
$lblK.Text = "Is this the right keyboard layout?"
$lblK.Font = $lblFont
$lblK.ForeColor = [System.Drawing.Color]::White
$lblK.AutoSize = $true
$lblK.Location = New-Object System.Drawing.Point(30,20)
$panelKeyboard.Controls.Add($lblK)

$listK = New-Object System.Windows.Forms.ListBox
$listK.Font = New-Object System.Drawing.Font("Segoe UI",12)
$listK.Size = New-Object System.Drawing.Size(300,180)
$listK.Location = New-Object System.Drawing.Point(30,60)
$listK.Items.AddRange(@("US","UK","German","French"))
$listK.SelectedIndex = 0
$panelKeyboard.Controls.Add($listK)

$btnKeyNext = New-Object System.Windows.Forms.Button
$btnKeyNext.Text = "Yes"
$btnKeyNext.Size = New-Object System.Drawing.Size(120,36)
$btnKeyNext.Location = New-Object System.Drawing.Point(30,260)
$btnKeyNext.Font = $lblFont
$panelKeyboard.Controls.Add($btnKeyNext)

# ---------- Drive Selection ----------
$lblD = New-Object System.Windows.Forms.Label
$lblD.Text = "Where do you want to install Windows?"
$lblD.Font = $lblFont
$lblD.ForeColor = [System.Drawing.Color]::White
$lblD.AutoSize = $true
$lblD.Location = New-Object System.Drawing.Point(30,20)
$panelDrive.Controls.Add($lblD)

$listDrives = New-Object System.Windows.Forms.ListBox
$listDrives.Font = New-Object System.Drawing.Font("Segoe UI",12)
$listDrives.Size = New-Object System.Drawing.Size(420,180)
$listDrives.Location = New-Object System.Drawing.Point(30,60)
$listDrives.Items.AddRange(@("Drive 0 - SSD (256 GB)","Drive 1 - HDD (1 TB)","Drive 2 - USB Drive (32 GB)"))
$listDrives.SelectedIndex = -1
$panelDrive.Controls.Add($listDrives)

$btnDriveNext = New-Object System.Windows.Forms.Button
$btnDriveNext.Text = "Next"
$btnDriveNext.Size = New-Object System.Drawing.Size(120,36)
$btnDriveNext.Location = New-Object System.Drawing.Point(30,260)
$btnDriveNext.Font = $lblFont
$panelDrive.Controls.Add($btnDriveNext)

# ---------- Installing ----------
$lblInstall = New-Object System.Windows.Forms.Label
$lblInstall.Text = "Installing Windows"
$lblInstall.Font = $bigFont
$lblInstall.ForeColor = [System.Drawing.Color]::White
$lblInstall.AutoSize = $true
$lblInstall.Location = New-Object System.Drawing.Point(30,20)
$panelInstalling.Controls.Add($lblInstall)

$lblInstallMsg = New-Object System.Windows.Forms.Label
$lblInstallMsg.Text = "Copying files..."
$lblInstallMsg.Font = New-Object System.Drawing.Font("Segoe UI",12)
$lblInstallMsg.ForeColor = [System.Drawing.Color]::White
$lblInstallMsg.AutoSize = $true
$lblInstallMsg.Location = New-Object System.Drawing.Point(30,80)
$panelInstalling.Controls.Add($lblInstallMsg)

$progress = New-Object System.Windows.Forms.ProgressBar
$progress.Size = New-Object System.Drawing.Size(700,30)
$progress.Location = New-Object System.Drawing.Point(30,120)
$progress.Style = 'Continuous'
$panelInstalling.Controls.Add($progress)

$lblPercent = New-Object System.Windows.Forms.Label
$lblPercent.Text = "0 %"
$lblPercent.Font = New-Object System.Drawing.Font("Segoe UI",12)
$lblPercent.ForeColor = [System.Drawing.Color]::White
$lblPercent.AutoSize = $true
$lblPercent.Location = New-Object System.Drawing.Point(30,160)
$panelInstalling.Controls.Add($lblPercent)

$installTimer = New-Object System.Windows.Forms.Timer
$installTimer.Interval = 300

# ---------- Wifi ----------
$lblWifi = New-Object System.Windows.Forms.Label
$lblWifi.Text = "Let's connect you to a network"
$lblWifi.Font = $lblFont
$lblWifi.ForeColor = [System.Drawing.Color]::White
$lblWifi.AutoSize = $true
$lblWifi.Location = New-Object System.Drawing.Point(30,20)
$panelWifi.Controls.Add($lblWifi)

$listWifi = New-Object System.Windows.Forms.ListBox
$listWifi.Font = New-Object System.Drawing.Font("Segoe UI",12)
$listWifi.Size = New-Object System.Drawing.Size(420,180)
$listWifi.Location = New-Object System.Drawing.Point(30,60)
$listWifi.Items.AddRange(@("Home Network","Office WiFi","Guest Network","Neighbor's WiFi"))
$listWifi.SelectedIndex = -1
$panelWifi.Controls.Add($listWifi)

$btnWifiSkip = New-Object System.Windows.Forms.Button
$btnWifiSkip.Text = "I don't have internet"
$btnWifiSkip.Size = New-Object System.Drawing.Size(200,36)
$btnWifiSkip.Location = New-Object System.Drawing.Point(30,260)
$btnWifiSkip.Font = $lblFont
$panelWifi.Controls.Add($btnWifiSkip)

# Wifi Password Panel
$lblWifiPass = New-Object System.Windows.Forms.Label
$lblWifiPass.Text = "Enter network password"
$lblWifiPass.Font = $lblFont
$lblWifiPass.ForeColor = [System.Drawing.Color]::White
$lblWifiPass.AutoSize = $true
$lblWifiPass.Location = New-Object System.Drawing.Point(30,20)
$panelWifiPass.Controls.Add($lblWifiPass)

$lblWifiName = New-Object System.Windows.Forms.Label
$lblWifiName.Text = "Network: "
$lblWifiName.Font = New-Object System.Drawing.Font("Segoe UI",12)
$lblWifiName.ForeColor = [System.Drawing.Color]::White
$lblWifiName.AutoSize = $true
$lblWifiName.Location = New-Object System.Drawing.Point(30,60)
$panelWifiPass.Controls.Add($lblWifiName)

$txtWifiPass = New-Object System.Windows.Forms.TextBox
$txtWifiPass.UseSystemPasswordChar = $true
$txtWifiPass.Size = New-Object System.Drawing.Size(300,28)
$txtWifiPass.Location = New-Object System.Drawing.Point(30,100)
$panelWifiPass.Controls.Add($txtWifiPass)

$btnWifiConnect = New-Object System.Windows.Forms.Button
$btnWifiConnect.Text = "Connect"
$btnWifiConnect.Size = New-Object System.Drawing.Size(120,36)
$btnWifiConnect.Location = New-Object System.Drawing.Point(30,140)
$btnWifiConnect.Font = $lblFont
$panelWifiPass.Controls.Add($btnWifiConnect)

$btnWifiBack = New-Object System.Windows.Forms.Button
$btnWifiBack.Text = "Back"
$btnWifiBack.Size = New-Object System.Drawing.Size(120,36)
$btnWifiBack.Location = New-Object System.Drawing.Point(160,140)
$btnWifiBack.Font = $lblFont
$panelWifiPass.Controls.Add($btnWifiBack)

# ---------- Account Type ----------
$lblAccType = New-Object System.Windows.Forms.Label
$lblAccType.Text = "How would you like to set up?"
$lblAccType.Font = $lblFont
$lblAccType.ForeColor = [System.Drawing.Color]::White
$lblAccType.AutoSize = $true
$lblAccType.Location = New-Object System.Drawing.Point(30,20)
$panelAccountType.Controls.Add($lblAccType)

$btnMicrosoft = New-Object System.Windows.Forms.Button
$btnMicrosoft.Text = "Sign in with Microsoft"
$btnMicrosoft.Size = New-Object System.Drawing.Size(260,60)
$btnMicrosoft.Location = New-Object System.Drawing.Point(30,70)
$btnMicrosoft.Font = New-Object System.Drawing.Font("Segoe UI",11)
$panelAccountType.Controls.Add($btnMicrosoft)

$btnLocal = New-Object System.Windows.Forms.Button
$btnLocal.Text = "Offline account"
$btnLocal.Size = New-Object System.Drawing.Size(260,60)
$btnLocal.Location = New-Object System.Drawing.Point(310,70)
$btnLocal.Font = New-Object System.Drawing.Font("Segoe UI",11)
$panelAccountType.Controls.Add($btnLocal)

# ---------- Microsoft Account Panels ----------
$lblMsEmail = New-Object System.Windows.Forms.Label
$lblMsEmail.Text = "Sign in with Microsoft - Enter email"
$lblMsEmail.Font = $lblFont
$lblMsEmail.ForeColor = [System.Drawing.Color]::White
$lblMsEmail.AutoSize = $true
$lblMsEmail.Location = New-Object System.Drawing.Point(30,20)
$panelMicrosoftAccount.Controls.Add($lblMsEmail)

$txtMsEmail = New-Object System.Windows.Forms.TextBox
$txtMsEmail.Size = New-Object System.Drawing.Size(380,28)
$txtMsEmail.Location = New-Object System.Drawing.Point(30,70)
$panelMicrosoftAccount.Controls.Add($txtMsEmail)

$btnMsNext = New-Object System.Windows.Forms.Button
$btnMsNext.Text = "Next"
$btnMsNext.Size = New-Object System.Drawing.Size(120,36)
$btnMsNext.Location = New-Object System.Drawing.Point(30,110)
$btnMsNext.Font = $lblFont
$panelMicrosoftAccount.Controls.Add($btnMsNext)

# MS Password
$lblMsPass = New-Object System.Windows.Forms.Label
$lblMsPass.Text = "Enter password"
$lblMsPass.Font = $lblFont
$lblMsPass.ForeColor = [System.Drawing.Color]::White
$lblMsPass.AutoSize = $true
$lblMsPass.Location = New-Object System.Drawing.Point(30,20)
$panelMicrosoftAccount.Controls.Add($lblMsPass) # reused label area

$txtMsPass = New-Object System.Windows.Forms.TextBox
$txtMsPass.UseSystemPasswordChar = $true
$txtMsPass.Size = New-Object System.Drawing.Size(300,28)
$txtMsPass.Location = New-Object System.Drawing.Point(30,120)
$panelMicrosoftAccount.Controls.Add($txtMsPass)

$btnMsSignIn = New-Object System.Windows.Forms.Button
$btnMsSignIn.Text = "Sign in"
$btnMsSignIn.Size = New-Object System.Drawing.Size(120,36)
$btnMsSignIn.Location = New-Object System.Drawing.Point(30,160)
$btnMsSignIn.Font = $lblFont
$panelMicrosoftAccount.Controls.Add($btnMsSignIn)

$btnMsBack = New-Object System.Windows.Forms.Button
$btnMsBack.Text = "Back"
$btnMsBack.Size = New-Object System.Drawing.Size(120,36)
$btnMsBack.Location = New-Object System.Drawing.Point(160,160)
$btnMsBack.Font = $lblFont
$panelMicrosoftAccount.Controls.Add($btnMsBack)

# ---------- Local account ----------
$lblLocal = New-Object System.Windows.Forms.Label
$lblLocal.Text = "Who's going to use this PC?"
$lblLocal.Font = $lblFont
$lblLocal.ForeColor = [System.Drawing.Color]::White
$lblLocal.AutoSize = $true
$lblLocal.Location = New-Object System.Drawing.Point(30,20)
$panelLocalAccount.Controls.Add($lblLocal)

$txtLocalUser = New-Object System.Windows.Forms.TextBox
$txtLocalUser.Size = New-Object System.Drawing.Size(300,28)
$txtLocalUser.Location = New-Object System.Drawing.Point(30,70)
$panelLocalAccount.Controls.Add($txtLocalUser)

$lblLocalPass = New-Object System.Windows.Forms.Label
$lblLocalPass.Text = "Create a password"
$lblLocalPass.Font = New-Object System.Drawing.Font("Segoe UI",12)
$lblLocalPass.ForeColor = [System.Drawing.Color]::White
$lblLocalPass.AutoSize = $true
$lblLocalPass.Location = New-Object System.Drawing.Point(30,110)
$panelLocalAccount.Controls.Add($lblLocalPass)

$txtLocalPass = New-Object System.Windows.Forms.TextBox
$txtLocalPass.UseSystemPasswordChar = $true
$txtLocalPass.Size = New-Object System.Drawing.Size(300,28)
$txtLocalPass.Location = New-Object System.Drawing.Point(30,140)
$panelLocalAccount.Controls.Add($txtLocalPass)

$txtLocalPassConfirm = New-Object System.Windows.Forms.TextBox
$txtLocalPassConfirm.UseSystemPasswordChar = $true
$txtLocalPassConfirm.Size = New-Object System.Drawing.Size(300,28)
$txtLocalPassConfirm.Location = New-Object System.Drawing.Point(30,180)
$panelLocalAccount.Controls.Add($txtLocalPassConfirm)

$btnLocalNext = New-Object System.Windows.Forms.Button
$btnLocalNext.Text = "Next"
$btnLocalNext.Size = New-Object System.Drawing.Size(120,36)
$btnLocalNext.Location = New-Object System.Drawing.Point(30,220)
$btnLocalNext.Font = $lblFont
$panelLocalAccount.Controls.Add($btnLocalNext)

# ---------- Privacy ----------
$lblPrivacy = New-Object System.Windows.Forms.Label
$lblPrivacy.Text = "Choose privacy settings for your device"
$lblPrivacy.Font = $lblFont
$lblPrivacy.ForeColor = [System.Drawing.Color]::White
$lblPrivacy.AutoSize = $true
$lblPrivacy.Location = New-Object System.Drawing.Point(30,20)
$panelPrivacy.Controls.Add($lblPrivacy)

$chkLoc = New-Object System.Windows.Forms.CheckBox
$chkLoc.Text = "Location"
$chkLoc.Checked = $true
$chkLoc.ForeColor = [System.Drawing.Color]::White
$chkLoc.Location = New-Object System.Drawing.Point(30,70)
$panelPrivacy.Controls.Add($chkLoc)

$chkDiag = New-Object System.Windows.Forms.CheckBox
$chkDiag.Text = "Diagnostics"
$chkDiag.Checked = $true
$chkDiag.ForeColor = [System.Drawing.Color]::White
$chkDiag.Location = New-Object System.Drawing.Point(30,100)
$panelPrivacy.Controls.Add($chkDiag)

$chkTailored = New-Object System.Windows.Forms.CheckBox
$chkTailored.Text = "Tailored experiences"
$chkTailored.Checked = $false
$chkTailored.ForeColor = [System.Drawing.Color]::White
$chkTailored.Location = New-Object System.Drawing.Point(30,130)
$panelPrivacy.Controls.Add($chkTailored)

$btnPrivacyAccept = New-Object System.Windows.Forms.Button
$btnPrivacyAccept.Text = "Accept"
$btnPrivacyAccept.Size = New-Object System.Drawing.Size(120,36)
$btnPrivacyAccept.Location = New-Object System.Drawing.Point(30,180)
$btnPrivacyAccept.Font = $lblFont
$panelPrivacy.Controls.Add($btnPrivacyAccept)

# ---------- Finalizing ----------
$lblFinal = New-Object System.Windows.Forms.Label
$lblFinal.Text = "Setting things up for you"
$lblFinal.Font = $bigFont
$lblFinal.ForeColor = [System.Drawing.Color]::White
$lblFinal.AutoSize = $true
$lblFinal.Location = New-Object System.Drawing.Point(30,20)
$panelFinalizing.Controls.Add($lblFinal)

$lblFinalMsg = New-Object System.Windows.Forms.Label
$lblFinalMsg.Text = "Getting your PC ready..."
$lblFinalMsg.Font = New-Object System.Drawing.Font("Segoe UI",12)
$lblFinalMsg.ForeColor = [System.Drawing.Color]::White
$lblFinalMsg.AutoSize = $true
$lblFinalMsg.Location = New-Object System.Drawing.Point(30,80)
$panelFinalizing.Controls.Add($lblFinalMsg)

$finalTimer = New-Object System.Windows.Forms.Timer
$finalTimer.Interval = 1500

# ---------- Boot & Lock & Login ----------
$lblBoot = New-Object System.Windows.Forms.Label
$lblBoot.Text = "Loading Windows..."
$lblBoot.Font = $bigFont
$lblBoot.ForeColor = [System.Drawing.Color]::White
$lblBoot.AutoSize = $true
$lblBoot.Location = New-Object System.Drawing.Point(30,40)
$panelBoot.Controls.Add($lblBoot)

$lblLockTime = New-Object System.Windows.Forms.Label
$lblLockTime.Text = Format-TimeNow12
$lblLockTime.Font = New-Object System.Drawing.Font("Segoe UI",24)
$lblLockTime.ForeColor = [System.Drawing.Color]::White
$lblLockTime.AutoSize = $true
$lblLockTime.Location = New-Object System.Drawing.Point(30,40)
$panelLock.Controls.Add($lblLockTime)

$lblLockDate = New-Object System.Windows.Forms.Label
$lblLockDate.Text = (Get-Date).ToString("dddd, MMMM d")
$lblLockDate.Font = New-Object System.Drawing.Font("Segoe UI",12)
$lblLockDate.ForeColor = [System.Drawing.Color]::White
$lblLockDate.AutoSize = $true
$lblLockDate.Location = New-Object System.Drawing.Point(30,90)
$panelLock.Controls.Add($lblLockDate)

# Login screen
$lblLoginUser = New-Object System.Windows.Forms.Label
$lblLoginUser.Text = $userData.username
$lblLoginUser.Font = New-Object System.Drawing.Font("Segoe UI",16)
$lblLoginUser.ForeColor = [System.Drawing.Color]::White
$lblLoginUser.AutoSize = $true
$lblLoginUser.Location = New-Object System.Drawing.Point(30,40)
$panelLogin.Controls.Add($lblLoginUser)

$txtLoginPass = New-Object System.Windows.Forms.TextBox
$txtLoginPass.UseSystemPasswordChar = $true
$txtLoginPass.Size = New-Object System.Drawing.Size(300,28)
$txtLoginPass.Location = New-Object System.Drawing.Point(30,80)
$panelLogin.Controls.Add($txtLoginPass)

$btnLogin = New-Object System.Windows.Forms.Button
$btnLogin.Text = "→"
$btnLogin.Size = New-Object System.Drawing.Size(60,28)
$btnLogin.Location = New-Object System.Drawing.Point(340,80)
$panelLogin.Controls.Add($btnLogin)

$lblLoginErr = New-Object System.Windows.Forms.Label
$lblLoginErr.Text = ""
$lblLoginErr.Font = New-Object System.Drawing.Font("Segoe UI",10)
$lblLoginErr.ForeColor = [System.Drawing.Color]::FromArgb(250,100,100)
$lblLoginErr.AutoSize = $true
$lblLoginErr.Location = New-Object System.Drawing.Point(30,120)
$panelLogin.Controls.Add($lblLoginErr)

# ---------- Desktop (simple) ----------
# Taskbar area inside the panel
$taskbar = New-Object System.Windows.Forms.Panel
$taskbar.Size = New-Object System.Drawing.Size(960,48)
$taskbar.Location = New-Object System.Drawing.Point(0,512)
$taskbar.BackColor = [System.Drawing.Color]::FromArgb(24,24,24)
$panelDesktop.Controls.Add($taskbar)

$btnStartMenu = New-Object System.Windows.Forms.Button
$btnStartMenu.Text = "⊞"
$btnStartMenu.Size = New-Object System.Drawing.Size(48,40)
$btnStartMenu.Location = New-Object System.Drawing.Point(10,6)
$btnStartMenu.Font = New-Object System.Drawing.Font("Segoe UI",12)
$taskbar.Controls.Add($btnStartMenu)

$lblClock = New-Object System.Windows.Forms.Label
$lblClock.Text = Format-TimeNow12 + "`n" + Format-DateNow
$lblClock.Size = New-Object System.Drawing.Size(150,40)
$lblClock.Location = New-Object System.Drawing.Point(800,4)
$lblClock.ForeColor = [System.Drawing.Color]::White
$lblClock.TextAlign = "MiddleCenter"
$taskbar.Controls.Add($lblClock)

# Start menu panel
$startPanel = New-Object System.Windows.Forms.Panel
$startPanel.Size = New-Object System.Drawing.Size(300,380)
$startPanel.Location = New-Object System.Drawing.Point(10,132)
$startPanel.BackColor = [System.Drawing.Color]::FromArgb(40,40,40)
$startPanel.Visible = $false
$panelDesktop.Controls.Add($startPanel)

$lblStartUser = New-Object System.Windows.Forms.Label
$lblStartUser.Text = "Hello, " + $userData.username
$lblStartUser.Font = New-Object System.Drawing.Font("Segoe UI",12)
$lblStartUser.ForeColor = [System.Drawing.Color]::White
$lblStartUser.AutoSize = $true
$lblStartUser.Location = New-Object System.Drawing.Point(12,12)
$startPanel.Controls.Add($lblStartUser)

# Start apps
$appsList = @(
    @{name='Calculator'; func='Open-Calculator'},
    @{name='Notepad'; func='Open-Notepad'},
    @{name='File Explorer'; func='Open-Explorer'},
    @{name='Settings'; func='Open-Settings'},
    @{name='Task Manager'; func='Open-TaskMgr'}
)
$y = 60
foreach ($app in $appsList) {
    $b = New-Object System.Windows.Forms.Button
    $b.Text = $app.name
    $b.Size = New-Object System.Drawing.Size(260,36)
    $b.Location = New-Object System.Drawing.Point(20,$y)
    $b.Tag = $app.func
    $b.Add_Click({
        $fn = $_.Source.Tag
        switch ($fn) {
            'Open-Calculator' { Open-Calculator }
            'Open-Notepad' { Open-Notepad }
            'Open-Explorer' { Open-Explorer }
            'Open-Settings' { Open-Settings }
            'Open-TaskMgr' { Open-TaskMgr }
        }
        $startPanel.Visible = $false
    })
    $startPanel.Controls.Add($b)
    $y += 46
}

# ---------- App windows functions ----------
function Open-Calculator {
    # small calculator form
    $calcForm = New-Object System.Windows.Forms.Form
    $calcForm.Text = "Calculator"
    $calcForm.Size = New-Object System.Drawing.Size(320,420)
    $calcForm.StartPosition = "CenterParent"
    $calcForm.Font = New-Object System.Drawing.Font("Segoe UI",12)
    $calcForm.BackColor = [System.Drawing.Color]::WhiteSmoke

    $display = New-Object System.Windows.Forms.TextBox
    $display.ReadOnly = $true
    $display.Text = "0"
    $display.Font = New-Object System.Drawing.Font("Consolas",20)
    $display.TextAlign = "Right"
    $display.Size = New-Object System.Drawing.Size(280,60)
    $display.Location = New-Object System.Drawing.Point(12,12)
    $calcForm.Controls.Add($display)

    $ops = @(
        @{t='7';x=12;y=90},{t='8';x=82;y=90},{t='9';x=152;y=90},{t='÷';x=222;y=90},
        @{t='4';x=12;y=150},{t='5';x=82;y=150},{t='6';x=152;y=150},{t='×';x=222;y=150},
        @{t='1';x=12;y=210},{t='2';x=82;y=210},{t='3';x=152;y=210},{t='−';x=222;y=210},
        @{t='0';x=12;y=270},{t='.';x=82;y=270},{t='=';x=152;y=270},{t='+';x=222;y=270}
    )
    $state = @{display='0'; memory=0; op=''; reset=$false}

    foreach ($b in $ops) {
        $btn = New-Object System.Windows.Forms.Button
        $btn.Text = $b.t
        $btn.Size = New-Object System.Drawing.Size(60,48)
        $btn.Location = New-Object System.Drawing.Point($b.x,$b.y)
        $btn.Font = New-Object System.Drawing.Font("Segoe UI",12)
        $btn.Add_Click({
            $txt = $display.Text
            $c = $([System.Windows.Forms.Button]$sender).Text
            if ($c -match '^[0-9]$') {
                if ($state.reset -or $txt -eq '0') { $display.Text = $c; $state.reset = $false } else { $display.Text = $txt + $c }
            } elseif ($c -eq '.') {
                if (-not $display.Text.Contains('.')) { $display.Text += '.' }
            } elseif ($c -eq '=') {
                if ($state.op -ne '') {
                    try {
                        $a = [double]$state.memory
                        $bval = [double]$display.Text
                        switch ($state.op) {
                            '+' { $res = $a + $bval }
                            '-' { $res = $a - $bval }
                            '×' { $res = $a * $bval }
                            '÷' { if ($bval -eq 0) { $res = 'Error' } else { $res = $a / $bval } }
                        }
                        $display.Text = $res.ToString()
                    } catch { $display.Text = "Error" }
                }
                $state.op = ''; $state.reset = $true
            } else {
                # operator
                try {
                    $state.memory = [double]$display.Text
                } catch { $state.memory = 0 }
                $state.op = $c
                $state.reset = $true
            }
        })
        $calcForm.Controls.Add($btn)
    }
    $calcForm.ShowDialog() | Out-Null
}

function Open-Notepad {
    $noteForm = New-Object System.Windows.Forms.Form
    $noteForm.Text = "Notepad"
    $noteForm.Size = New-Object System.Drawing.Size(700,520)
    $noteForm.StartPosition = "CenterParent"

    $txt = New-Object System.Windows.Forms.TextBox
    $txt.Multiline = $true
    $txt.ScrollBars = 'Both'
    $txt.Font = New-Object System.Drawing.Font("Consolas",12)
    $txt.Size = New-Object System.Drawing.Size(660,420)
    $txt.Location = New-Object System.Drawing.Point(12,12)
    $noteForm.Controls.Add($txt)

    $btnSave = New-Object System.Windows.Forms.Button
    $btnSave.Text = "Save"
    $btnSave.Location = New-Object System.Drawing.Point(12,440)
    $btnSave.Size = New-Object System.Drawing.Size(80,32)
    $btnSave.Add_Click({
        $path = Join-Path $env:TEMP "notepad_$(Get-Random).txt"
        $txt.Text | Out-File -FilePath $path -Encoding UTF8
        [System.Windows.Forms.MessageBox]::Show("Saved to $path","Notepad")
    })
    $noteForm.Controls.Add($btnSave)

    $noteForm.ShowDialog() | Out-Null
}

function Open-Explorer {
    [System.Windows.Forms.MessageBox]::Show("This is a simulated File Explorer.","File Explorer")
}

function Open-Settings {
    [System.Windows.Forms.MessageBox]::Show("Settings are simulated here.","Settings")
}

function Open-TaskMgr {
    [System.Windows.Forms.MessageBox]::Show("Simple Task Manager (simulated).","Task Manager")
}

# ---------- Clock update timer ----------
$clockTimer = New-Object System.Windows.Forms.Timer
$clockTimer.Interval = 1000
$clockTimer.Add_Tick({
    $lblClock.Text = Format-TimeNow12 + "`n" + Format-DateNow
    $lblLockTime.Text = Format-TimeNow12
    $lblLockDate.Text = (Get-Date).ToString("dddd, MMMM d")
})
$clockTimer.Start()

# ---------- Install Timer Logic ----------
$installProgress = 0
$installMessages = @(
    'Copying Windows files...',
    'Getting files ready for installation...',
    'Installing features...',
    'Installing updates...',
    'Finishing up...'
)
$msgIndex = 0
$installTimer.Add_Tick({
    $installProgress += (Get-Random -Minimum 2 -Maximum 8)
    if ($installProgress -gt 100) { $installProgress = 100 }
    $progress.Value = $installProgress
    $lblPercent.Text = "$installProgress %"
    $lblInstallMsg.Text = $installMessages[[math]::Min([int]($installProgress/20), $installMessages.Count-1)]
    if ($installProgress -ge 100) {
        $installTimer.Stop()
        Start-Sleep -Milliseconds 700
        Show-Panel $panelBoot
        Start-Boot
    }
})

# ---------- Finalizing Timer ----------
$finalMsgs = @(
    'Getting your PC ready...',
    'This might take a few minutes...',
    'Installing apps...',
    'Applying your settings...',
    'Almost there...',
    "Let's get started!"
)
$finalIndex = 0
$finalTimer.Add_Tick({
    $finalIndex++
    if ($finalIndex -ge $finalMsgs.Count) {
        $finalTimer.Stop()
        # Save user data then boot
        Save-UserData $userData
        Show-Panel $panelBoot
        Start-Boot
        return
    }
    $lblFinalMsg.Text = $finalMsgs[$finalIndex]
})

# ---------- Boot sequence ----------
$bootTimer = New-Object System.Windows.Forms.Timer
$bootTimer.Interval = 800
$bootIndex = 0
$bootMsgs = @('Loading Windows...','Starting services...','Loading system files...')
function Start-Boot {
    $lblBoot.Text = $bootMsgs[0]
    $bootIndex = 1
    $bootTimer.Start()
}
$bootTimer.Add_Tick({
    if ($bootIndex -lt $bootMsgs.Count) {
        $lblBoot.Text = $bootMsgs[$bootIndex]
        $bootIndex++
    } else {
        $bootTimer.Stop()
        Start-Sleep -Milliseconds 600
        Show-Panel $panelLock
    }
})

# ---------- Login logic ----------
$btnLogin.Add_Click({
    if ($txtLoginPass.Text -eq $userData.password) {
        $lblLoginErr.Text = ""
        $txtLoginPass.Text = ""
        Start-LoginSeq
    } else {
        $lblLoginErr.Text = "Incorrect password. Please try again."
        $txtLoginPass.Text = ""
    }
})

function Start-LoginSeq {
    # small 'logging in' sequence then show desktop
    $logForm = New-Object System.Windows.Forms.Form
    $logForm.Size = New-Object System.Drawing.Size(420,180)
    $logForm.StartPosition = "CenterParent"
    $logForm.Text = "Signing in..."
    $lbl1 = New-Object System.Windows.Forms.Label
    $lbl1.Text = "Signing in..."
    $lbl1.Font = New-Object System.Drawing.Font("Segoe UI",12)
    $lbl1.AutoSize = $true
    $lbl1.Location = New-Object System.Drawing.Point(20,20)
    $logForm.Controls.Add($lbl1)
    $logForm.Show()
    Start-Sleep -Milliseconds 1200
    $lbl1.Text = "Setting up your account..."
    Start-Sleep -Milliseconds 1200
    $logForm.Close()
    Show-Panel $panelDesktop
    $lblStartUser.Text = "Hello, " + $userData.username
}

# ---------- Show Panel helper ----------
function Show-Panel([System.Windows.Forms.Panel]$panelToShow) {
    foreach ($c in $form.Controls) {
        if ($c -is [System.Windows.Forms.Panel]) { $c.Visible = $false }
    }
    $panelToShow.Visible = $true
    $panelToShow.BringToFront()
}

# ---------- Buttons wiring: navigation ----------
$btnStart.Add_Click({ Show-Panel $panelRegion })

$btnRegionNext.Add_Click({
    $sel = $listRegions.SelectedItem
    if ($null -eq $sel) { $sel = "United States" }
    $userData.region = $sel
    Show-Panel $panelKeyboard
})

$btnKeyNext.Add_Click({
    $userData.keyboard = $listK.SelectedItem
    Show-Panel $panelDrive
})

$btnDriveNext.Add_Click({
    if ($listDrives.SelectedIndex -lt 0) {
        [System.Windows.Forms.MessageBox]::Show("Please select a drive","Select Drive",[System.Windows.Forms.MessageBoxButtons]::OK,[System.Windows.Forms.MessageBoxIcon]::Warning) | Out-Null
        return
    }
    $userData.selectedDrive = $listDrives.SelectedIndex
    Show-Panel $panelInstalling
    # start installation simulation
    $installProgress = 0
    $progress.Value = 0
    $lblPercent.Text = "0 %"
    $lblInstallMsg.Text = $installMessages[0]
    $installTimer.Start()
})

$listWifi.Add_DoubleClick({
    if ($listWifi.SelectedItem) {
        $userData.wifiNetwork = $listWifi.SelectedItem
        if ($userData.wifiNetwork -eq 'Guest Network') {
            Show-Panel $panelAccountType
        } else {
            $lblWifiName.Text = "Network: " + $userData.wifiNetwork
            $txtWifiPass.Text = ""
            Show-Panel $panelWifiPass
        }
    }
})

$btnWifiSkip.Add_Click({
    $userData.wifiNetwork = "offline"
    Show-Panel $panelAccountType
})

$btnWifiBack.Add_Click({ Show-Panel $panelWifi })

$btnWifiConnect.Add_Click({
    if (-not $txtWifiPass.Text) {
        [System.Windows.Forms.MessageBox]::Show("Please enter the network password","Wi-Fi",[System.Windows.Forms.MessageBoxButtons]::OK,[System.Windows.Forms.MessageBoxIcon]::Warning) | Out-Null
        return
    }
    $userData.wifiNetwork = $lblWifiName.Text -replace '^Network: ',''
    Show-Panel $panelAccountType
})

$btnMicrosoft.Add_Click({ Show-Panel $panelMicrosoftAccount })
$btnLocal.Add_Click({ Show-Panel $panelLocalAccount })

$btnMsNext.Add_Click({
    if (-not $txtMsEmail.Text) { [System.Windows.Forms.MessageBox]::Show("Please enter an email","Microsoft",[System.Windows.Forms.MessageBoxButtons]::OK,[System.Windows.Forms.MessageBoxIcon]::Warning) | Out-Null; return }
    $userData.email = $txtMsEmail.Text
    $userData.username = $userData.email.Split('@')[0]
    # show password -> use same panel but ensure controls visible
    $lblMsEmail.Text = "Enter password for " + $userData.email
    $txtMsEmail.Visible = $false
    $btnMsNext.Visible = $false
    $txtMsPass.Visible = $true
    $btnMsSignIn.Visible = $true
    $btnMsBack.Visible = $true
})

$btnMsBack.Add_Click({
    $txtMsEmail.Visible = $true
    $btnMsNext.Visible = $true
    $txtMsPass.Visible = $false
    $btnMsSignIn.Visible = $false
    $txtMsEmail.Text = ""
    $txtMsPass.Text = ""
    Show-Panel $panelAccountType
})

$btnMsSignIn.Add_Click({
    if (-not $txtMsPass.Text) { [System.Windows.Forms.MessageBox]::Show("Please enter password","Microsoft",[System.Windows.Forms.MessageBoxButtons]::OK,[System.Windows.Forms.MessageBoxIcon]::Warning) | Out-Null; return }
    $userData.password = $txtMsPass.Text
    Show-Panel $panelPrivacy
})

$btnLocalNext.Add_Click({
    if (-not $txtLocalUser.Text) { [System.Windows.Forms.MessageBox]::Show("Please enter username","Account",[System.Windows.Forms.MessageBoxButtons]::OK,[System.Windows.Forms.MessageBoxIcon]::Warning) | Out-Null; return }
    if ($txtLocalPass.Text -ne $txtLocalPassConfirm.Text) { [System.Windows.Forms.MessageBox]::Show("Passwords do not match","Account",[System.Windows.Forms.MessageBoxButtons]::OK,[System.Windows.Forms.MessageBoxIcon]::Warning) | Out-Null; return }
    $userData.username = $txtLocalUser.Text
    $userData.password = $txtLocalPass.Text
    Show-Panel $panelPrivacy
})

$btnPrivacyAccept.Add_Click({
    $userData.privacyLocation = $chkLoc.Checked
    $userData.privacyDiagnostics = $chkDiag.Checked
    $userData.privacyTailored = $chkTailored.Checked
    Show-Panel $panelFinalizing
    $finalIndex = 0
    $lblFinalMsg.Text = $finalMsgs[0]
    $finalTimer.Start()
})

# ---------- Start Menu toggling ----------
$btnStartMenu.Add_Click({ $startPanel.Visible = -not $startPanel.Visible })

# ---------- Shutdown / restart simulation ----------
# Add items in start menu or simple keyboard handling omitted for brevity (user asked for GUI & apps)

# ---------- Show initial panel ----------
Show-Panel $panelWelcome

# ---------- Save userData on form close ----------
$form.Add_FormClosing({
    Save-UserData $userData
})

# ---------- Run the form ----------
[void][System.Windows.Forms.Application]::Run($form)
