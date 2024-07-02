# storylinemapper/timeline.py

from typing import List
import spacy

nlp = spacy.load("en_core_web_sm")

def extract_events(text: str) -> List[str]:
    doc = nlp(text)
    events = []
    for ent in doc.ents:
        if ent.label_ in ["DATE", "TIME"]:
            events.append(ent.text)
    return events

def generate_timeline_iframe(events: List[str], width: str = "960px", height: str = "600px") -> str:
    event_items = "".join([f"<li>{event}</li>" for event in events])
    
    html_template = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{
            font-family: Arial, sans-serif;
        }}
        .timeline {{
            list-style-type: none;
            padding: 0;
        }}
        .timeline li {{
            margin: 10px 0;
        }}
    </style>
</head>
<body>
    <div style="width: {width}; height: {height};">
        <ul class="timeline">
            {event_items}
        </ul>
    </div>
</body>
</html>
    """
    return html_template
