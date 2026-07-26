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
    const manifest = json as { name?: string; display?: string };

    return {
      ok:
        response.ok &&
        manifest.name === "bingd." &&
        manifest.display === "standalone",
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

  if (cronSecret) {
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
  } else {
    checks.push({
      name: "notification dry run",
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
