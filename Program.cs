using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace MemeCraft IA;

class Program
{
    static readonly HttpClient client = new();
    const string API_KEY = "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";
    const string API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

    static async Task Main(string[] args)
    {
        Console.Title = "MemeCraft IA Code Assistant";
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("MemeCraft IA Code Assistant v2.0");
        Console.ResetColor();
        Console.WriteLine("Escribe 'help' para comandos.\n");

        while (true)
        {
            Console.Write("MemeCraft IA > ");
            var input = Console.ReadLine()?.Trim();
            if (string.IsNullOrEmpty(input)) continue;
            if (input == "exit") break;
            if (input == "help")
            {
                Console.WriteLine("cd [ruta] - Cargar proyecto");
                Console.WriteLine("ls - Listar archivos");
                Console.WriteLine("abrir [archivo] - Ver archivo");
                Console.WriteLine("editar [instruccion] - Modificar archivo");
                Console.WriteLine("salir - Salir");
                continue;
            }
            await SendToAI(input);
        }
    }

    static async Task SendToAI(string prompt)
    {
        var payload = new
        {
            model = "mistralai/mixtral-8x7b-instruct-v0.1",
            messages = new[] { new { role = "user", content = prompt } },
            temperature = 0.4,
            max_tokens = 4096
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", API_KEY);

        var response = await client.PostAsync(API_URL, content);
        var responseStr = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"Error: {response.StatusCode}");
            return;
        }

        using var doc = JsonDocument.Parse(responseStr);
        var answer = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
        Console.WriteLine($"\n{answer}\n");
    }
}
