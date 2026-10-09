plugins {
    id("com.android.application")
}

// Byggnummer från GitHub Actions så att varje ny APK kan installeras över den gamla
val buildNumber = (System.getenv("GITHUB_RUN_NUMBER") ?: "1").toInt()

android {
    namespace = "se.turnering.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "se.turnering.app"
        minSdk = 26
        targetSdk = 34
        versionCode = buildNumber
        versionName = "1.0.$buildNumber"
    }

    // Fast signeringsnyckel i repot: uppdateringar kan installeras utan att
    // appen (och dess data) först måste avinstalleras.
    signingConfigs {
        create("app") {
            storeFile = file("turnering.keystore")
            storePassword = "turnering"
            keyAlias = "turnering"
            keyPassword = "turnering"
        }
    }

    buildTypes {
        getByName("debug") {
            signingConfig = signingConfigs.getByName("app")
        }
        getByName("release") {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("app")
        }
    }

    // Webbappen i ../web paketeras som assets
    sourceSets {
        getByName("main") {
            assets.srcDirs("../web")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
