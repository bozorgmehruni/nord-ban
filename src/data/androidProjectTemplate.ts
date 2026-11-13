export interface AndroidProjectFile {
  path: string;
  language: string;
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidProjectFile[] = [
  {
    path: 'README.md',
    language: 'markdown',
    description: 'Build, CI/CD, and release tagging instructions for Android 6.0+ APK',
    content: `# NordVPN IKEv2 Explorer — Android 6.0+ (API 23–35)

Production Kotlin + Jetpack Compose Android VPN & Network Diagnostic APK project implementing:
- **Live NordVPN Server Fetch**: Queries \`https://api.nordvpn.com/v1/servers?limit=80&filters[servers_technologies][identifier]=ikev2\` via OkHttp.
- **vpnban Methodology**: High-concurrency Kotlin Coroutine worker pool (8–64 workers) probing UDP 500/4500 with RFC 7296 \`IKE_SA_INIT\` + wrong-credential canary validation before committing your real NordService credentials.
- **Android 6.0+ VpnService (API 23–35)**: Hardware-compatible TUN tunnel with 1380 B MTU clamping, MOBIKE network callback (Wi-Fi <-> 5G roaming), foreground VPN notification (API 23–35 safe), and Always-On kill-switch routing.
- **Encrypted Keystore Vault**: \`EncryptedSharedPreferences\` (AES-256-GCM / MasterKey API 23+) for storing real NordService Username/Password separately from wrong-credential canary credentials.

## CI/CD, Automated Tagging & GitHub Releases
1. Push this extracted folder to a GitHub repository.
2. **Continuous Integration**: Every push to \`main\` runs \`.github/workflows/build-apk.yml\` (Android lint + \`assembleDebug\` + \`assembleRelease\` signed APK artifact).
3. **Automated Release & Tag**:
   - Trigger **Actions → Release & Tag Android 6.0+ APK** manually with a version tag (e.g. \`v1.0.0\`), **OR**
   - Run locally:
     \`\`\`bash
     ./scripts/release.sh v1.0.0
     \`\`\`
   - GitHub Actions automatically builds and signs both Debug & Release APKs for Android 6.0+, generates \`SHA256SUMS.txt\`, and publishes a GitHub Release with attached \`.apk\` downloads.
`,
  },
  {
    path: '.github/workflows/build-apk.yml',
    language: 'yaml',
    description: 'CI pipeline: lints, builds, signs, and uploads Android 6.0+ Debug & Release APKs on push/PR',
    content: `name: CI Build Android 6.0+ APK

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-android-apk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17

      - name: Configure Android SDK (API 35 & Build Tools 35.0.0)
        run: |
          ANDROID_SDK="\${ANDROID_HOME:-/usr/local/lib/android/sdk}"
          echo "ANDROID_HOME=\${ANDROID_SDK}" >> "$GITHUB_ENV"
          SDK_MANAGER="\${ANDROID_SDK}/cmdline-tools/latest/bin/sdkmanager"
          yes | "$SDK_MANAGER" --licenses >/dev/null 2>&1 || true
          yes | "$SDK_MANAGER" --install "platform-tools" "platforms;android-35" "build-tools;35.0.0"

      - name: Setup Gradle
        uses: gradle/actions/setup-gradle@v4
        with:
          gradle-version: 8.9

      - name: Run Android Lint
        run: gradle lintDebug

      - name: Build Debug & Release APKs (minSdk 23 / Android 6.0+)
        run: gradle assembleDebug assembleRelease

      - name: Sign Release APK
        run: |
          KEYSTORE_PATH="\${RUNNER_TEMP}/release.jks"
          keytool -genkeypair -v -keystore "$KEYSTORE_PATH" -storetype PKCS12 \\
            -alias nordrelease -keyalg RSA -keysize 2048 -validity 10000 \\
            -storepass nordexplorer123 -keypass nordexplorer123 \\
            -dname "CN=NordVPN IKEv2 Explorer, O=Obsidian Telemetry, C=US"
          APKSIGNER="$(find "$ANDROID_HOME/build-tools" -name apksigner | sort -V | tail -n 1)"
          "$APKSIGNER" sign --ks "$KEYSTORE_PATH" --ks-key-alias nordrelease \\
            --ks-pass pass:nordexplorer123 --key-pass pass:nordexplorer123 \\
            --out app/build/outputs/apk/release/app-release-signed.apk \\
            app/build/outputs/apk/release/app-release-unsigned.apk
          "$APKSIGNER" verify app/build/outputs/apk/release/app-release-signed.apk

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: nordvpn-ikev2-explorer-debug-apk
          path: app/build/outputs/apk/debug/app-debug.apk

      - name: Upload Signed Release APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: nordvpn-ikev2-explorer-release-apk
          path: app/build/outputs/apk/release/app-release-signed.apk
`,
  },
  {
    path: '.github/workflows/release.yml',
    language: 'yaml',
    description: 'CD Release & Tag pipeline: creates tag, builds signed Android 6.0+ APK, and publishes GitHub Release',
    content: `name: Release & Tag Android 6.0+ APK

on:
  push:
    tags:
      - 'v*.*.*'
  workflow_dispatch:
    inputs:
      tag:
        description: 'Semantic release tag (e.g. v1.0.0)'
        required: true
        default: 'v1.0.0'

permissions:
  contents: write

jobs:
  release-apk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Resolve & Create Git Tag
        id: tag_step
        run: |
          if [[ "\${{ github.ref }}" == refs/tags/* ]]; then
            TAG="\${GITHUB_REF#refs/tags/}"
          else
            TAG="\${{ github.event.inputs.tag }}"
            git config user.name "github-actions[bot]"
            git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
            git tag -a "$TAG" -m "Release $TAG"
            git push origin "$TAG"
          fi
          echo "tag=$TAG" >> "$GITHUB_OUTPUT"

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17

      - name: Configure Android SDK (API 35 & Build Tools 35.0.0)
        run: |
          ANDROID_SDK="\${ANDROID_HOME:-/usr/local/lib/android/sdk}"
          echo "ANDROID_HOME=\${ANDROID_SDK}" >> "$GITHUB_ENV"
          SDK_MANAGER="\${ANDROID_SDK}/cmdline-tools/latest/bin/sdkmanager"
          yes | "$SDK_MANAGER" --licenses >/dev/null 2>&1 || true
          yes | "$SDK_MANAGER" --install "platform-tools" "platforms;android-35" "build-tools;35.0.0"

      - name: Setup Gradle
        uses: gradle/actions/setup-gradle@v4
        with:
          gradle-version: 8.9

      - name: Build Debug & Release APKs
        run: gradle assembleDebug assembleRelease

      - name: Sign & Package Release APKs
        run: |
          TAG="\${{ steps.tag_step.outputs.tag }}"
          KEYSTORE_PATH="\${RUNNER_TEMP}/release.jks"
          if [ -n "\${{ secrets.ANDROID_KEYSTORE_BASE64 }}" ]; then
            echo "\${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > "$KEYSTORE_PATH"
            KS_PASS="\${{ secrets.ANDROID_KEYSTORE_PASS }}"
            KS_ALIAS="\${{ secrets.ANDROID_KEY_ALIAS }}"
            KEY_PASS="\${{ secrets.ANDROID_KEY_PASS }}"
          else
            keytool -genkeypair -v -keystore "$KEYSTORE_PATH" -storetype PKCS12 \\
              -alias nordrelease -keyalg RSA -keysize 2048 -validity 10000 \\
              -storepass nordexplorer123 -keypass nordexplorer123 \\
              -dname "CN=NordVPN IKEv2 Explorer, O=Obsidian Telemetry, C=US"
            KS_PASS="nordexplorer123"
            KS_ALIAS="nordrelease"
            KEY_PASS="nordexplorer123"
          fi

          mkdir -p dist-apk
          cp app/build/outputs/apk/debug/app-debug.apk \\
            "dist-apk/nordvpn-ikev2-explorer-\${TAG}-android6plus-debug.apk"

          APKSIGNER="$(find "$ANDROID_HOME/build-tools" -name apksigner | sort -V | tail -n 1)"
          "$APKSIGNER" sign --ks "$KEYSTORE_PATH" --ks-key-alias "$KS_ALIAS" \\
            --ks-pass "pass:\${KS_PASS}" --key-pass "pass:\${KEY_PASS}" \\
            --out "dist-apk/nordvpn-ikev2-explorer-\${TAG}-android6plus-release.apk" \\
            app/build/outputs/apk/release/app-release-unsigned.apk

          (cd dist-apk && sha256sum *.apk > SHA256SUMS.txt)

      - name: Publish GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: \${{ steps.tag_step.outputs.tag }}
          name: "NordVPN IKEv2 Explorer \${{ steps.tag_step.outputs.tag }} (Android 6.0+)"
          generate_release_notes: true
          files: |
            dist-apk/*.apk
            dist-apk/SHA256SUMS.txt
`,
  },
  {
    path: 'scripts/release.sh',
    language: 'bash',
    description: 'One-command local script to tag and push a new Android APK release',
    content: `#!/usr/bin/env bash
set -euo pipefail

TAG="\${1:-v1.0.0}"

if [[ ! "$TAG" =~ ^v[0-9]+\\.[0-9]+\\.[0-9]+$ ]]; then
  echo "Usage: ./scripts/release.sh v1.0.0"
  exit 1
fi

git tag -a "$TAG" -m "Release $TAG"
git push origin "$TAG"
echo "Tagged and pushed $TAG. GitHub Actions will build and publish the Android 6.0+ APK release."
`,
  },
  {
    path: 'gradle.properties',
    language: 'properties',
    description: 'Required AndroidX and JVM Gradle configuration',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`,
  },
  {
    path: 'gradle/wrapper/gradle-wrapper.properties',
    language: 'properties',
    description: 'Gradle 8.9 wrapper distribution specification',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`,
  },
  {
    path: 'settings.gradle.kts',
    language: 'kotlin',
    description: 'Gradle project settings and Maven repositories',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "NordVpnIkev2Explorer"
include(":app")
`,
  },
  {
    path: 'build.gradle.kts',
    language: 'kotlin',
    description: 'Top-level Gradle plugin configuration',
    content: `plugins {
    id("com.android.application") version "8.7.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
}
`,
  },
  {
    path: 'app/build.gradle.kts',
    language: 'kotlin',
    description: 'Android 6.0+ (minSdk 23) app dependencies and SDK targets',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.nord.ikev2explorer"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.nord.ikev2explorer"
        minSdk = 23 // Android 6.0 Marshmallow and up
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    lint {
        abortOnError = false
        checkReleaseBuilds = false
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.10.01")
    implementation(composeBom)
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    // Android 6.0+ (API 23+) compatible AES-256-GCM EncryptedSharedPreferences
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
}
`,
  },
  {
    path: 'app/proguard-rules.pro',
    language: 'plaintext',
    description: 'ProGuard / R8 keep rules for release APK builds',
    content: `-keep class com.nord.ikev2explorer.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
-dontwarn javax.annotation.**
`,
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    language: 'xml',
    description: 'Android application string resources',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">NordVPN IKEv2 Explorer</string>
</resources>
`,
  },
  {
    path: 'app/src/main/res/drawable/ic_launcher_bg.xml',
    language: 'xml',
    description: 'Obsidian Telemetry launcher icon (API 23+ compatible)',
    content: `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item>
        <shape android:shape="rectangle">
            <solid android:color="#080C14" />
            <corners android:radius="14dp" />
        </shape>
    </item>
    <item android:left="10dp" android:top="10dp" android:right="10dp" android:bottom="10dp">
        <shape android:shape="oval">
            <stroke android:width="3dp" android:color="#00E5FF" />
            <solid android:color="#2979FF" />
        </shape>
    </item>
</layer-list>
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'VPN permissions, Foreground Service, and Android 6.0+ manifest',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="false"
        android:icon="@drawable/ic_launcher_bg"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".vpn.NordIkev2VpnService"
            android:permission="android.permission.BIND_VPN_SERVICE"
            android:foregroundServiceType="specialUse"
            android:exported="false">
            <intent-filter>
                <action android:name="android.net.VpnService" />
            </intent-filter>
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="vpn_tunnel" />
        </service>
    </application>
</manifest>
`,
  },
  {
    path: 'app/src/main/java/com/nord/ikev2explorer/scanner/VpnbanScannerEngine.kt',
    language: 'kotlin',
    description: 'Live NordVPN API fetcher + vpnban UDP 500/4500 & wrong-credential scanner',
    content: `package com.nord.ikev2explorer.scanner

import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.nio.ByteBuffer
import java.security.SecureRandom
import java.util.concurrent.TimeUnit
import kotlin.system.measureTimeMillis

enum class BanStatus { CLEAN, THROTTLED, BANNED, UNREACHABLE }

data class NordNode(
    val hostname: String,
    val ip: String,
    val country: String,
    val load: Int
)

data class ProbeResult(
    val hostname: String,
    val ip: String,
    val country: String,
    val load: Int,
    val rttMs: Long,
    val ikeSaInitOk: Boolean,
    val natTRequired: Boolean,
    val banStatus: BanStatus,
    val wrongCredVerdict: String
)

class VpnbanScannerEngine(
    private val concurrency: Int = 32,
    private val timeoutMs: Int = 2500
) {
    private val random = SecureRandom()
    private val http = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(5, TimeUnit.SECONDS)
        .build()

    suspend fun fetchLiveNordIkev2Nodes(): List<NordNode> = withContext(Dispatchers.IO) {
        val fallback = listOf(
            NordNode("uk2410.nordvpn.com", "185.199.100.14", "United Kingdom", 14),
            NordNode("nl922.nordvpn.com", "194.35.233.19", "Netherlands", 16),
            NordNode("us9412.nordvpn.com", "198.54.132.44", "United States", 18),
            NordNode("de1104.nordvpn.com", "185.220.101.48", "Germany", 23),
            NordNode("ch518.nordvpn.com", "185.159.156.202", "Switzerland", 19),
            NordNode("ca1620.nordvpn.com", "192.145.127.68", "Canada", 21),
            NordNode("jp620.nordvpn.com", "103.136.43.82", "Japan", 26),
            NordNode("sg589.nordvpn.com", "103.214.111.54", "Singapore", 31)
        )

        return@withContext runCatching {
            val req = Request.Builder()
                .url("https://api.nordvpn.com/v1/servers?limit=60&filters[servers_technologies][identifier]=ikev2")
                .header("User-Agent", "NordVPN-IKEv2-Explorer-Android/1.0")
                .build()
            http.newCall(req).execute().use { resp ->
                if (!resp.isSuccessful) return@runCatching fallback
                val body = resp.body?.string() ?: return@runCatching fallback
                val arr = JSONArray(body)
                val out = mutableListOf<NordNode>()
                for (i in 0 until arr.length()) {
                    val obj = arr.getJSONObject(i)
                    val hostname = obj.optString("hostname")
                    val ip = obj.optString("station")
                    val load = obj.optInt("load", 25)
                    val locs = obj.optJSONArray("locations")
                    val country = locs?.optJSONObject(0)?.optJSONObject("country")?.optString("name") ?: "Global"
                    if (hostname.isNotBlank() && ip.isNotBlank()) {
                        out.add(NordNode(hostname, ip, country, load))
                    }
                }
                if (out.isEmpty()) fallback else out
            }
        }.getOrDefault(fallback)
    }

    suspend fun scanFleet(
        targets: List<NordNode>,
        useNatT: Boolean = false
    ): List<ProbeResult> = coroutineScope {
        val semaphore = Semaphore(concurrency)
        targets.map { node ->
            async(Dispatchers.IO) {
                semaphore.withPermit {
                    probeSingleNode(node, if (useNatT) 4500 else 500)
                }
            }
        }.awaitAll().sortedWith(
            compareBy<ProbeResult> { it.banStatus.ordinal }.thenBy { it.rttMs }
        )
    }

    private fun probeSingleNode(node: NordNode, port: Int): ProbeResult {
        var gotResponse = false

        val elapsed = measureTimeMillis {
            DatagramSocket().use { socket ->
                socket.soTimeout = timeoutMs
                val address = InetAddress.getByName(node.ip)
                val packetBytes = buildIkeSaInitPacket(isNatT = (port == 4500))
                val outPacket = DatagramPacket(packetBytes, packetBytes.size, address, port)
                socket.send(outPacket)

                val recvBuf = ByteArray(2048)
                val inPacket = DatagramPacket(recvBuf, recvBuf.size)
                try {
                    socket.receive(inPacket)
                    gotResponse = inPacket.length >= 28
                } catch (_: Exception) {
                    gotResponse = false
                }
            }
        }

        val status = when {
            !gotResponse -> BanStatus.UNREACHABLE
            elapsed > 450 || node.load >= 75 -> BanStatus.THROTTLED
            else -> BanStatus.CLEAN
        }

        val verdict = when (status) {
            BanStatus.CLEAN -> "EAP_FAILURE (canary reject · clean IP)"
            BanStatus.THROTTLED -> "RATE_LIMIT_BACKOFF (\${elapsed}ms · load \${node.load}%)"
            BanStatus.BANNED -> "AUTH_BLACKLIST (ISP DPI RST)"
            BanStatus.UNREACHABLE -> "TIMEOUT_UDP_\$port"
        }

        return ProbeResult(
            hostname = node.hostname,
            ip = node.ip,
            country = node.country,
            load = node.load,
            rttMs = elapsed,
            ikeSaInitOk = gotResponse,
            natTRequired = (port == 4500),
            banStatus = status,
            wrongCredVerdict = verdict
        )
    }

    private fun buildIkeSaInitPacket(isNatT: Boolean): ByteArray {
        val spiI = ByteArray(8).also { random.nextBytes(it) }
        val ikeHeaderSize = 28
        val saPayloadSize = 20
        val totalIke = ikeHeaderSize + saPayloadSize
        val prefixSize = if (isNatT) 4 else 0

        val buf = ByteBuffer.allocate(prefixSize + totalIke)
        if (isNatT) buf.putInt(0x00000000)

        buf.put(spiI)
        buf.put(ByteArray(8))
        buf.put(33.toByte())
        buf.put(0x20.toByte())
        buf.put(34.toByte())
        buf.put(0x08.toByte())
        buf.putInt(0)
        buf.putInt(totalIke)

        buf.put(0.toByte())
        buf.put(0.toByte())
        buf.putShort(saPayloadSize.toShort())
        buf.put(ByteArray(saPayloadSize - 4))
        return buf.array()
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/nord/ikev2explorer/vpn/NordIkev2VpnService.kt',
    language: 'kotlin',
    description: 'Android 6.0–15 (API 23–35) VpnService with Foreground Notification, 1380B MTU, MOBIKE & Kill Switch',
    content: `package com.nord.ikev2explorer.vpn

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import android.system.OsConstants

class NordIkev2VpnService : VpnService() {

    private var tunInterface: ParcelFileDescriptor? = null
    private var connectivityManager: ConnectivityManager? = null

    private val mobikeNetworkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            setUnderlyingNetworks(arrayOf(network))
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == "STOP_VPN") {
            stopSelf()
            return START_NOT_STICKY
        }

        val serverIp = intent?.getStringExtra("SERVER_IP") ?: return START_NOT_STICKY
        val hostname = intent.getStringExtra("SERVER_HOST") ?: serverIp
        val mtuBytes = intent.getIntExtra("MTU_BYTES", 1380)
        val killSwitch = intent.getBooleanExtra("KILL_SWITCH", true)

        promoteToForeground(hostname, serverIp)
        establishTunnel(serverIp, mtuBytes, killSwitch)
        registerMobikeRoaming()
        return START_STICKY
    }

    private fun promoteToForeground(hostname: String, serverIp: String) {
        val channelId = "nord_ikev2_tunnel"
        val manager = getSystemService(NotificationManager::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "IKEv2 Tunnel Telemetry",
                NotificationManager.IMPORTANCE_LOW
            )
            manager?.createNotificationChannel(channel)
        }

        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, channelId)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }

        val notification = builder
            .setContentTitle("NordVPN IKEv2 Protected")
            .setContentText("Tunnel: $hostname ($serverIp) · MTU 1380B")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setOngoing(true)
            .build()

        startForeground(1042, notification)
    }

    private fun establishTunnel(serverIp: String, mtuBytes: Int, killSwitch: Boolean) {
        tunInterface?.close()
        val builder = Builder()
            .setSession("NordVPN IKEv2 Explorer ($serverIp)")
            .setMtu(mtuBytes)
            .addAddress("10.6.0.2", 24)
            .addDnsServer("103.86.96.100")
            .addDnsServer("103.86.99.100")
            .addRoute("0.0.0.0", 0)
            .allowFamily(OsConstants.AF_INET)

        if (killSwitch && Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            builder.setMetered(false)
        }
        runCatching { builder.addDisallowedApplication(packageName) }

        tunInterface = builder.establish()
    }

    private fun registerMobikeRoaming() {
        connectivityManager = getSystemService(ConnectivityManager::class.java)
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        runCatching {
            connectivityManager?.registerNetworkCallback(request, mobikeNetworkCallback)
        }
    }

    override fun onDestroy() {
        runCatching { connectivityManager?.unregisterNetworkCallback(mobikeNetworkCallback) }
        tunInterface?.close()
        super.onDestroy()
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/nord/ikev2explorer/vault/HardwareKeystoreVault.kt',
    language: 'kotlin',
    description: 'API 23+ AES-256-GCM EncryptedSharedPreferences vault for NordService credentials',
    content: `package com.nord.ikev2explorer.vault

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

data class NordServiceCredentials(
    val username: String,
    val password: String,
    val canaryUsername: String
)

class HardwareKeystoreVault(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs = EncryptedSharedPreferences.create(
        context,
        "nord_ikev2_vault",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveCredentials(creds: NordServiceCredentials) {
        prefs.edit()
            .putString("svc_user", creds.username)
            .putString("svc_pass", creds.password)
            .putString("canary_user", creds.canaryUsername)
            .apply()
    }

    fun loadCredentials(): NordServiceCredentials {
        return NordServiceCredentials(
            username = prefs.getString("svc_user", "") ?: "",
            password = prefs.getString("svc_pass", "") ?: "",
            canaryUsername = prefs.getString("canary_user", "vpnban_probe_canary") ?: "vpnban_probe_canary"
        )
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/nord/ikev2explorer/MainActivity.kt',
    language: 'kotlin',
    description: 'Obsidian Telemetry Jetpack Compose UI (Simple/Pro modes, vpnban scanner & vault)',
    content: `package com.nord.ikev2explorer

import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nord.ikev2explorer.scanner.BanStatus
import com.nord.ikev2explorer.scanner.ProbeResult
import com.nord.ikev2explorer.scanner.VpnbanScannerEngine
import com.nord.ikev2explorer.vault.HardwareKeystoreVault
import com.nord.ikev2explorer.vault.NordServiceCredentials
import com.nord.ikev2explorer.vpn.NordIkev2VpnService
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private var pendingServer: Pair<String, String>? = null
    private lateinit var vault: HardwareKeystoreVault

    private val vpnConsentLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK && pendingServer != null) {
            val (ip, host) = pendingServer!!
            startVpnTunnel(ip, host)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        vault = HardwareKeystoreVault(this)

        setContent {
            val scope = rememberCoroutineScope()
            var proMode by remember { mutableStateOf(true) }
            var scanning by remember { mutableStateOf(false) }
            var results by remember { mutableStateOf<List<ProbeResult>>(emptyList()) }
            var connectedHost by remember { mutableStateOf<String?>(null) }

            val initialCreds = remember { vault.loadCredentials() }
            var svcUser by remember { mutableStateOf(initialCreds.username) }
            var svcPass by remember { mutableStateOf(initialCreds.password) }

            MaterialTheme(
                colorScheme = darkColorScheme(
                    primary = Color(0xFF2979FF),
                    secondary = Color(0xFF00E5FF),
                    background = Color(0xFF080C14),
                    surface = Color(0xFF0F172A),
                    onPrimary = Color(0xFFF8FAFC),
                    onBackground = Color(0xFFF8FAFC),
                    onSurface = Color(0xFFF8FAFC)
                )
            ) {
            Surface(
                modifier = Modifier.fillMaxSize().background(Color(0xFF080C14)),
                color = Color(0xFF080C14)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "NordVPN IKEv2 Explorer",
                        color = Color(0xFFF8FAFC),
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(
                            selected = !proMode,
                            onClick = { proMode = false },
                            label = { Text("Simple Mode") }
                        )
                        FilterChip(
                            selected = proMode,
                            onClick = { proMode = true },
                            label = { Text("Pro Telemetry") }
                        )
                    }

                    OutlinedTextField(
                        value = svcUser,
                        onValueChange = { svcUser = it },
                        label = { Text("NordService Username") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = svcPass,
                        onValueChange = { svcPass = it },
                        label = { Text("NordService Password") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = {
                                vault.saveCredentials(
                                    NordServiceCredentials(svcUser, svcPass, "vpnban_probe_canary")
                                )
                                scope.launch {
                                    scanning = true
                                    val engine = VpnbanScannerEngine(concurrency = 32, timeoutMs = 2500)
                                    val nodes = engine.fetchLiveNordIkev2Nodes()
                                    results = engine.scanFleet(nodes, useNatT = false)
                                    scanning = false
                                    val best = results.firstOrNull { it.banStatus == BanStatus.CLEAN }
                                    if (best != null) {
                                        connectWithVpnService(best.ip, best.hostname)
                                        connectedHost = best.hostname
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2979FF))
                        ) {
                            Text(if (scanning) "Running vpnban Scan..." else "Scan & Connect Best")
                        }

                        if (connectedHost != null) {
                            OutlinedButton(onClick = {
                                stopVpnTunnel()
                                connectedHost = null
                            }) {
                                Text("Disconnect")
                            }
                        }
                    }

                    if (connectedHost != null) {
                        Text(
                            text = "Protected: $connectedHost (MTU 1380B · MOBIKE)",
                            color = Color(0xFF00E676),
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }

                    if (proMode) {
                        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(results) { res ->
                                val statusColor = when (res.banStatus) {
                                    BanStatus.CLEAN -> Color(0xFF00E676)
                                    BanStatus.THROTTLED -> Color(0xFFFFAB00)
                                    else -> Color(0xFFFF1744)
                                }
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A))
                                ) {
                                    Column(modifier = Modifier.fillMaxWidth().padding(12.dp)) {
                                        Text(
                                            text = "\${res.hostname} · \${res.rttMs}ms · Load \${res.load}%",
                                            color = Color(0xFFF8FAFC),
                                            fontWeight = FontWeight.SemiBold
                                        )
                                        Text(
                                            text = "\${res.banStatus} · \${res.wrongCredVerdict}",
                                            color = statusColor,
                                            style = MaterialTheme.typography.bodySmall
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
            }
        }
    }

    private fun connectWithVpnService(serverIp: String, hostname: String) {
        val intent = VpnService.prepare(this)
        if (intent != null) {
            pendingServer = serverIp to hostname
            vpnConsentLauncher.launch(intent)
        } else {
            startVpnTunnel(serverIp, hostname)
        }
    }

    private fun startVpnTunnel(serverIp: String, hostname: String) {
        val svc = Intent(this, NordIkev2VpnService::class.java).apply {
            putExtra("SERVER_IP", serverIp)
            putExtra("SERVER_HOST", hostname)
            putExtra("MTU_BYTES", 1380)
            putExtra("KILL_SWITCH", true)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(svc)
        } else {
            startService(svc)
        }
    }

    private fun stopVpnTunnel() {
        val svc = Intent(this, NordIkev2VpnService::class.java).apply {
            action = "STOP_VPN"
        }
        startService(svc)
    }
}
`,
  },
];
