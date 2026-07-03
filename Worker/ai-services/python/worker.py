import sys
import json
import importlib
import traceback
import os

# Add the parent `app/` directory to path so `app.config`, `app.services`, etc. resolve
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

_services = {}

def get_service(name):
    if name not in _services:
        _services[name] = importlib.import_module(f'app.services.{name}')
    return _services[name]

def handle(method, params):
    if method == 'code_evaluate':
        svc = get_service('code_evaluator')
        return svc.CodeQualityEvaluator().evaluate(**params)
    elif method == 'plagiarism_check':
        svc = get_service('plagiarism_detector')
        return svc.PlagiarismDetector().check(**params)
    elif method == 'screen_resume':
        svc = get_service('resume_screener')
        return svc.ResumeScreener().screen(**params)
    elif method == 'evaluate_interview':
        svc = get_service('interview_response_evaluator')
        return svc.InterviewResponseEvaluator().evaluate(**params)
    elif method == 'predict_difficulty':
        svc = get_service('difficulty_predictor')
        return svc.DifficultyPredictor().predict(**params)
    elif method == 'generate_quiz':
        svc = get_service('quiz_generator')
        return svc.QuizQuestionGenerator().generate(**params)
    elif method == 'code_review':
        svc = get_service('code_evaluator')
        return svc.CodeQualityEvaluator().review(**params)
    elif method == 'notebook_ingest':
        svc = get_service('notebook_service')
        return svc.NotebookService().ingest_source(**params)
    elif method == 'notebook_chat':
        svc = get_service('notebook_service')
        return svc.NotebookService().chat(**params)
    elif method == 'notebook_generate':
        svc = get_service('notebook_service')
        gen_type = params.pop('type', params.pop('gen_type', 'summary'))
        return svc.NotebookService().generate(gen_type=gen_type, **params)
    elif method == 'health':
        return {'status': 'ok', 'services': list(_services.keys())}
    else:
        raise ValueError(f'Unknown method: {method}')

if __name__ == '__main__':
    # Signal ready to the Node.js bridge
    sys.stdout.write(json.dumps({'id': 0, 'ready': True}) + '\n')
    sys.stdout.flush()

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            request = json.loads(line)
            result = handle(request['method'], request.get('params', {}))
            response = {'id': request['id'], 'result': result}
        except Exception as e:
            tb = traceback.format_exc()
            # Only include traceback in development to avoid leaking internals
            response = {'id': request.get('id', -1), 'error': str(e)}
            if os.getenv('NODE_ENV', 'development') != 'production':
                response['traceback'] = tb
        sys.stdout.write(json.dumps(response) + '\n')
        sys.stdout.flush()
