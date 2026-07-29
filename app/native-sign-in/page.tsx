import NativeEmailAuthForm from "@/components/NativeEmailAuthForm";

export default function NativeSignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-base px-4 py-10 text-white">
      <NativeEmailAuthForm mode="sign-in" />
    </main>
  );
}
