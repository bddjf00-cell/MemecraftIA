#!/usr/bin/env python3
"""
MemeCraft IA Python Assistant - Chat IA desde terminal
"""
import requests
import json
import sys

API_KEY = "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"
API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

def chat(mensaje):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    payload = {
        "model": "mistralai/mixtral-8x7b-instruct-v0.1",
        "messages": [{"role": "user", "content": mensaje}],
        "temperature": 0.4,
        "max_tokens": 4096
    }
    try:
        r = requests.post(API_URL, json=payload, headers=headers)
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    print("MemeCraft IA Python Assistant")
    print("Escribe 'salir' para terminar\n")
    while True:
        try:
            texto = input("MemeCraft IA > ").strip()
            if texto.lower() in ("salir", "exit"): break
            if texto:
                respuesta = chat(texto)
                print(f"\n{respuesta}\n")
        except KeyboardInterrupt:
            break
