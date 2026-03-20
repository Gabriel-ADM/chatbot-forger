{
    "name": "Document",
    "type": "object",
    "properties": {
      "chatbot_id": {
        "type": "string",
        "description": "ID do chatbot ao qual o documento pertence"
      },
      "file_name": {
        "type": "string",
        "description": "Nome do arquivo"
      },
      "file_url": {
        "type": "string",
        "description": "URL do arquivo enviado"
      },
      "file_type": {
        "type": "string",
        "description": "Tipo do arquivo (pdf, docx, pptx)"
      },
      "status": {
        "type": "string",
        "enum": [
          "active",
          "pending_deletion"
        ],
        "default": "active",
        "description": "Status do documento"
      }
    },
    "required": [
      "chatbot_id",
      "file_name",
      "file_url"
    ]
  }