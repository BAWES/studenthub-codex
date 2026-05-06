export function ThemeScript() {
  const code = `
    try {
      var stored = localStorage.getItem("studenthub-theme");
      var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      document.documentElement.dataset.theme = theme;
    } catch {
      document.documentElement.dataset.theme = "light";
    }
  `;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
