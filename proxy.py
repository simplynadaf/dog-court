#!/usr/bin/env python3
"""
PawWise — Local Bedrock Proxy Server
Mimics the Gemini API format but routes to Amazon Bedrock Nova Pro.
Frontend code stays identical — just change the API URL.
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import boto3
import base64
import threading

PORT = 5555
MODEL_ID = 'amazon.nova-pro-v1:0'

bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')


class ProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight."""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_POST(self):
        """Handle Gemini-format requests, route to Bedrock."""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(content_length))

            # Parse Gemini format request
            contents = body.get('contents', [])
            if not contents:
                self.send_error_response(400, 'No contents provided')
                return

            parts = contents[0].get('parts', [])
            
            # Build Bedrock message
            bedrock_content = []
            
            for part in parts:
                if 'text' in part:
                    bedrock_content.append({'text': part['text']})
                elif 'inline_data' in part:
                    # Image data
                    img_data = part['inline_data']
                    mime = img_data.get('mime_type', 'image/jpeg')
                    ext = mime.split('/')[-1]
                    if ext == 'jpg':
                        ext = 'jpeg'
                    bedrock_content.append({
                        'image': {
                            'format': ext,
                            'source': {'bytes': img_data['data']}
                        }
                    })

            # Call Bedrock
            bedrock_body = {
                'messages': [{'role': 'user', 'content': bedrock_content}],
                'inferenceConfig': {
                    'temperature': body.get('generationConfig', {}).get('temperature', 0.8),
                    'maxTokens': 4000
                }
            }

            response = bedrock.invoke_model(
                modelId=MODEL_ID,
                contentType='application/json',
                accept='application/json',
                body=json.dumps(bedrock_body)
            )

            result = json.loads(response['body'].read())
            text = result['output']['message']['content'][0]['text']

            # Clean up JSON if wrapped in code fences
            clean_text = text.strip()
            if clean_text.startswith('```json'):
                clean_text = clean_text[7:]
            if clean_text.startswith('```'):
                clean_text = clean_text[3:]
            if clean_text.endswith('```'):
                clean_text = clean_text[:-3]
            clean_text = clean_text.strip()

            # Return in Gemini response format
            gemini_response = {
                'candidates': [{
                    'content': {
                        'parts': [{'text': clean_text}]
                    }
                }]
            }

            self.send_response(200)
            self.send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(gemini_response).encode())

        except Exception as e:
            print(f'❌ Error: {e}')
            self.send_error_response(500, str(e))

    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def send_error_response(self, code, message):
        self.send_response(code)
        self.send_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'error': {'message': message}}).encode())

    def log_message(self, format, *args):
        # Cleaner logging
        print(f'  → {args[0]}')


if __name__ == '__main__':
    print(f'''
🐾 PawWise Bedrock Proxy
━━━━━━━━━━━━━━━━━━━━━━━━
  Model:  {MODEL_ID}
  Port:   {PORT}
  URL:    http://localhost:{PORT}
  
  Frontend connects to this instead of Gemini API.
  All requests routed through Amazon Bedrock Nova Pro.
━━━━━━━━━━━━━━━━━━━━━━━━
''')
    server = HTTPServer(('0.0.0.0', PORT), ProxyHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n🛑 Proxy stopped.')
        server.shutdown()
