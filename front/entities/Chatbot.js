{
    "name": "Chatbot",
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Nome do chatbot"
      },
      "persona_prompt": {
        "type": "string",
        "description": "Prompt de persona/cliente do chatbot (m\u00e1ximo 200 caracteres)"
      },
      "status": {
        "type": "string",
        "enum": [
          "active",
          "inactive"
        ],
        "default": "inactive",
        "description": "Status do chatbot"
      },
      "document_count": {
        "type": "number",
        "default": 0,
        "description": "Quantidade de documentos vinculados"
      }
    },
    "required": [
      "name",
      "persona_prompt"
    ]
  }