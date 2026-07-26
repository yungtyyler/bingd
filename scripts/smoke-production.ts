import "dotenv/config";

type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
};

const baseAddress = (
  process.env.SMOKE_BASE_ADDRESS ||
  process.env.BASE_ADDRESS
)?.replace(/\/$/, "");
const cronSecret = process.env.CRON_SECRET;

if (!baseAddress) {
  throw new Error("BASE_ADDRESS is required.");
}

async function readText(path: string) {
  const response = await fetch(`${baseAddress}${path}`);
  const text = await response.text();

  return { response, text };
}

async function readJson(path: string, init?: RequestInit) {
  const response = await fetch(`${baseAddress}${path}`, init);
  const json = (await response.json()) as unknown;

  return { response, json };
}

function formatResult(result: CheckResult) {
  const status = result.ok ? "PASS" : "FAIL";
  return `${status} ${result.name}: ${result.detail}`;
}

const checks: CheckResult[] = [];

async function addCheck(
  name: string,
  run: () => Promise<{ ok: boolean; detail: string }>,
) {
  try {
    checks.push({ name, ...(await run()) });
  } catch (error) {
    checks.push({
      name,
      ok: false,
      detail:
        error instanceof Error
          ? `${error.message}${error.cause ? ` (${String(error.cause)})` : ""}`
          : "Unknown error",
    });
  }
}

async function main() {
  await addCheck("home page", async () => {
    const { response, text } = await readText("/");

    return {
      ok: response.ok && text.includes("bingd"),
      detail: `HTTP ${response.status}`,
    };
  });

  await addCheck("manifest", async () => {
    const { response, json } = await readJson("/manifest.webmanifest");
    const manifest = json as {
      name?: string;
      display?: string;
      icons?: Array<{ src?: string; sizes?: string; purpose?: string }>;
    };
    const hasIcon512 = manifest.icons?.some(
      (icon) => icon.src === "/icons/icon-512.png" && icon.sizes === "512x512",
    );
    const hasMaskable512 = manifest.icons?.some(
      (icon) =>
        icon.src === "/icons/maskable-512.png" &&
        icon.sizes === "512x512" &&
        icon.purpose === "maskable",
    );

    return {
      ok:
        response.ok &&
        manifest.name === "bingd." &&
        manifest.display === "standalone" &&
        hasIcon512 === true &&
        hasMaskable512 === true,
      detail: `HTTP ${response.status}, display=${manifest.display || "missing"}`,
    };
  });

  await addCheck("robots", async () => {
    const { response, text } = await readText("/robots.txt");

    return {
      ok: response.ok && text.includes("/sitemap.xml"),
      detail: `HTTP ${response.status}`,
    };
  });

  await addCheck("not found page", async () => {
    const { response, text } = await readText("/__smoke_missing_page__");

    return {
      ok: response.status === 404 && text.includes("Page Not Found"),
      detail: `HTTP ${response.status}`,
    };
  });

  await addCheck("health", async () => {
    const { response, json } = await readJson("/api/health");
    const result = json as { success?: boolean; status?: string };

    return {
      ok: response.ok && result.success === true && result.status === "ok",
      detail: `HTTP ${response.status}, status=${result.status ?? "?"}`,
    };
  });

  await addCheck("send notifications rejects anonymous", async () => {
    const { response } = await readJson(
      "/api/send-notifications?dryRun=true",
    );

    return {
      ok: response.status === 401,
      detail: `HTTP ${response.status}`,
    };
  });

  await addCheck("sync shows rejects anonymous", async () => {
    const { response } = await readJson("/api/sync-shows");

    return {
      ok: response.status === 401,
      detail: `HTTP ${response.status}`,
    };
  });

  await addCheck("daily cron rejects anonymous", async () => {
    const { response } = await readJson("/api/cron/daily?dryRun=true");

    return {
      ok: response.status === 401,
      detail: `HTTP ${response.status}`,
    };
  });

  if (cronSecret) {
    await addCheck("health config", async () => {
      const { response, json } = await readJson("/api/health", {
        headers: {
          authorization: `Bearer ${cronSecret}`,
        },
      });
      const result = json as {
        success?: boolean;
        checks?: Array<{ name?: string; ok?: boolean }>;
      };
      const failedChecks =
        result.checks
          ?.filter((check) => check.ok !== true)
          .map((check) => check.name || "unknown") ?? [];

      return {
        ok:
          response.ok &&
          result.success === true &&
          Array.isArray(result.checks) &&
          failedChecks.length === 0,
        detail: `HTTP ${response.status}, failed=${
          failedChecks.length > 0 ? failedChecks.join(",") : "none"
        }`,
      };
    });

    await addCheck("notification dry run", async () => {
      const { response, json } = await readJson(
        "/api/send-notifications?dryRun=true",
        {
          headers: {
            authorization: `Bearer ${cronSecret}`,
          },
        },
      );
      const result = json as {
        success?: boolean;
        dryRun?: boolean;
        checked?: number;
        eligible?: number;
        skipped?: Record<string, number>;
      };

      return {
        ok: response.ok && result.success === true && result.dryRun === true,
        detail: `HTTP ${response.status}, checked=${result.checked ?? "?"}, eligible=${
          result.eligible ?? "?"
        }`,
      };
    });

    await addCheck("daily cron dry run", async () => {
      const { response, json } = await readJson("/api/cron/daily?dryRun=true", {
        headers: {
          authorization: `Bearer ${cronSecret}`,
        },
      });
      const result = json as {
        success?: boolean;
        dryRun?: boolean;
        sync?: { skipped?: boolean };
        notifications?: { status?: number };
      };

      return {
        ok:
          response.ok &&
          result.success === true &&
          result.dryRun === true &&
          result.sync?.skipped === true &&
          result.notifications?.status === 200,
        detail: `HTTP ${response.status}, notificationStatus=${
          result.notifications?.status ?? "?"
        }`,
      };
    });
  } else {
    checks.push({
      name: "health config",
      ok: false,
      detail: "CRON_SECRET is missing.",
    });
    checks.push({
      name: "notification dry run",
      ok: false,
      detail: "CRON_SECRET is missing.",
    });
    checks.push({
      name: "daily cron dry run",
      ok: false,
      detail: "CRON_SECRET is missing.",
    });
  }

  for (const check of checks) {
    console.log(formatResult(check));
  }

  const failed = checks.filter((check) => !check.ok);

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
