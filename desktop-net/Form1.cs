using Microsoft.Web.WebView2.WinForms;

namespace MemeCraftIA;

public partial class Form1 : Form
{
    private WebView2 webView;

    public Form1()
    {
        InitializeComponent();
        Text = "MemeCraft Code";
        WindowState = FormWindowState.Maximized;
        StartPosition = FormStartPosition.CenterScreen;
        MinimumSize = new Size(900, 600);

        webView = new WebView2 { Dock = DockStyle.Fill };
        Controls.Add(webView);

        var htmlPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, @"..\..\index.html"));
        webView.CoreWebView2InitializationCompleted += (s, e) =>
        {
            if (e.IsSuccess)
            {
                webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
                webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = true;
                webView.CoreWebView2.Navigate(htmlPath);
            }
        };

        webView.EnsureCoreWebView2Async();
    }
}
