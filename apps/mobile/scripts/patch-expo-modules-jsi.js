const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const packageRoot = path.join(__dirname, "..", "node_modules", "expo-modules-jsi");
const appleRoot = path.join(packageRoot, "apple");
const blockedAttributes = [
  "com.apple.FinderInfo",
  "com.apple.ResourceFork",
  "com.apple.quarantine",
];

function walkPaths(root) {
  const paths = [];
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    paths.push(current);

    let stat;
    try {
      stat = fs.lstatSync(current);
    } catch {
      continue;
    }

    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      continue;
    }

    for (const entry of fs.readdirSync(current)) {
      stack.push(path.join(current, entry));
    }
  }

  return paths;
}

function removeBlockedAttributes(targetPath) {
  for (const attribute of blockedAttributes) {
    try {
      execFileSync("/usr/bin/xattr", ["-d", attribute, targetPath], {
        stdio: "ignore",
      });
    } catch {
      // xattr exits non-zero when an attribute is absent; that is fine here.
    }
  }
}

if (fs.existsSync(packageRoot)) {
  try {
    execFileSync("/usr/bin/xattr", ["-cr", packageRoot], { stdio: "ignore" });
    for (const targetPath of walkPaths(packageRoot).reverse()) {
      removeBlockedAttributes(targetPath);
      if (
        targetPath.endsWith(".framework") ||
        targetPath.endsWith(".framework.dSYM") ||
        targetPath.endsWith(".xcframework")
      ) {
        execFileSync("/usr/bin/xattr", ["-cr", targetPath], { stdio: "ignore" });
        removeBlockedAttributes(targetPath);
      }
    }
    for (const targetPath of walkPaths(packageRoot)) {
      if (
        targetPath.endsWith(".framework") ||
        targetPath.endsWith(".framework.dSYM") ||
        targetPath.endsWith(".xcframework")
      ) {
        removeBlockedAttributes(targetPath);
      }
    }
    console.log("[patch-expo-modules-jsi] Cleared macOS extended attributes.");
  } catch {
    console.warn("[patch-expo-modules-jsi] Could not clear macOS extended attributes.");
  }
}

const target = path.join(
  appleRoot,
  "Sources",
  "ExpoModulesJSI",
  "Coding",
  "JavaScriptCodable+Date.swift",
);

if (!fs.existsSync(target)) {
  console.warn("[patch-expo-modules-jsi] Target file not found; skipping.");
  process.exit(0);
}

const dateSource = fs.readFileSync(target, "utf8");
const patchedDateSource = dateSource.replace(
  "guard milliseconds.isFinite, abs(milliseconds) <= maxJavaScriptDateMilliseconds else {",
  "guard milliseconds.isFinite, milliseconds.magnitude <= maxJavaScriptDateMilliseconds else {",
);

if (patchedDateSource !== dateSource) {
  fs.writeFileSync(target, patchedDateSource);
  console.log("[patch-expo-modules-jsi] Applied Swift Date magnitude patch.");
} else {
  console.log("[patch-expo-modules-jsi] Swift Date patch already applied or upstream changed.");
}

const buildScript = path.join(
  appleRoot,
  "scripts",
  "build-xcframework.sh",
);

if (!fs.existsSync(buildScript)) {
  console.warn("[patch-expo-modules-jsi] Build script not found; skipping xattr patch.");
  process.exit(0);
}

const buildScriptSource = fs.readFileSync(buildScript, "utf8");
const xattrPatch = [
  "  # Xcode can reject generated frameworks that inherit macOS extended attributes.",
  '  /usr/bin/xattr -cr "$framework_src" 2>/dev/null || true',
].join("\n");
const buildScriptMarker = [
  '  if [[ ! -d "$framework_src" ]]; then',
  '    log "error: xcodebuild did not produce ${framework_src}"',
  "    exit 1",
  "  fi",
].join("\n");

if (buildScriptSource.includes(xattrPatch)) {
  console.log("[patch-expo-modules-jsi] xattr patch already applied.");
} else if (buildScriptSource.includes(buildScriptMarker)) {
  fs.writeFileSync(
    buildScript,
    buildScriptSource.replace(
      buildScriptMarker,
      `${buildScriptMarker}\n\n${xattrPatch}`,
    ),
  );
  console.log("[patch-expo-modules-jsi] Applied generated framework xattr patch.");
} else {
  console.warn("[patch-expo-modules-jsi] Build script marker changed; skipping xattr patch.");
}

const codeSigningPatch = "    CODE_SIGNING_ALLOWED=NO \\";
const codeSigningMarker = "    SKIP_INSTALL=NO \\";
const buildScriptAfterXattr = fs.readFileSync(buildScript, "utf8");

if (buildScriptAfterXattr.includes(codeSigningPatch)) {
  console.log("[patch-expo-modules-jsi] nested code-signing patch already applied.");
} else if (buildScriptAfterXattr.includes(codeSigningMarker)) {
  fs.writeFileSync(
    buildScript,
    buildScriptAfterXattr.replace(
      codeSigningMarker,
      `${codeSigningMarker}\n${codeSigningPatch}`,
    ),
  );
  console.log("[patch-expo-modules-jsi] Applied nested code-signing patch.");
} else {
  console.warn("[patch-expo-modules-jsi] Code-signing marker changed; skipping patch.");
}
