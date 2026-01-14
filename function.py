import json
import boto3
import os

def handler(event, context):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    }
    
    try:
        body = json.loads(event.get('body', '{}'))
        query = body.get('query', '')
        
        if not query:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'query is required'})
            }
        
        bedrock_agent = boto3.client('bedrock-agent-runtime', region_name=os.environ.get('AWS_REGION', 'us-west-2'))
        sts = boto3.client('sts', region_name=os.environ.get('AWS_REGION', 'us-west-2'))
        account_id = sts.get_caller_identity()['Account']
        
        response = bedrock_agent.retrieve_and_generate(
            input={'text': query},
            retrieveAndGenerateConfiguration={
                'type': 'KNOWLEDGE_BASE',
                'knowledgeBaseConfiguration': {
                    'knowledgeBaseId': os.environ['KNOWLEDGE_BASE_ID'],
                    'modelArn': f'arn:aws:bedrock:{os.environ.get("AWS_REGION", "us-west-2")}:{account_id}:inference-profile/us.anthropic.claude-sonnet-4-5-20250929-v1:0',
                    'retrievalConfiguration': {
                        'vectorSearchConfiguration': {
                            'numberOfResults': 5
                        }
                    },
                    'generationConfiguration': {
                        'inferenceConfig': {
                            'textInferenceConfig': {
                                'temperature': 0.2
                            }
                        }
                    }
                }
            }
        )
        
        # result = {
        #     'answer': response['output']['text'],
        #     'citations': [
        #         {
        #             'content': cite.get('retrievedReferences', [{}])[0].get('content', {}).get('text', ''),
        #             'location': cite.get('retrievedReferences', [{}])[0].get('location', {})
        #         }
        #         for cite in response.get('citations', [])[:5]
        #     ]
        # }

        # Safely extract citations
        formatted_citations = []
        for cite in response.get('citations', []):
            references = cite.get('retrievedReferences', [])
            
            if references:  # Only process if the list is not empty
                ref = references[0]
                formatted_citations.append({
                    'content': ref.get('content', {}).get('text', ''),
                    'location': ref.get('location', {})
                })
            
            if len(formatted_citations) >= 5:
                break

        result = {
            'answer': response['output']['text'],
            'citations': formatted_citations
        }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(result)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
