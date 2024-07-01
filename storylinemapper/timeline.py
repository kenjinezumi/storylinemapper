# storylinemapper/timeline.py

import matplotlib.pyplot as plt
import spacy
from typing import Dict, List
from collections import defaultdict
import datetime

nlp = spacy.load("en_core_web_sm")

def extract_events(text: str) -> Dict[str, List[int]]:
    """
    Extracts events from the given text based on detected dates and times.

    Args:
        text (str): The input text.

    Returns:
        Dict[str, List[int]]: A dictionary where keys are event descriptions and values are their positions in the text.
    """
    doc = nlp(text)
    events = defaultdict(list)

    for ent in doc.ents:
        if ent.label_ in ["DATE", "TIME", "EVENT"]:
            events[ent.text].append(ent.start_char)

    return events

def generate_timeline(events: Dict[str, List[int]], title: str = "Event Timeline", event_color: str = 'blue', font_size: int = 12) -> None:
    """
    Generates a timeline of events.

    Args:
        events (Dict[str, List[int]]): A dictionary of events and their positions.
        title (str): The title of the timeline.
        event_color (str): The color of the event markers.
        font_size (int): The font size of the event labels.
    """
    event_dates = sorted(events.items(), key=lambda x: x[1])

    plt.figure(figsize=(10, 6))

    y_pos = range(len(event_dates))
    event_labels = [event for event, _ in event_dates]
    event_times = [datetime.datetime.now() - datetime.timedelta(days=i*30) for i in range(len(event_dates))]

    plt.plot(event_times, y_pos, marker='o', linestyle='-', color=event_color)

    plt.yticks(y_pos, event_labels, fontsize=font_size)
    plt.gca().invert_yaxis()

    plt.title(title)
    plt.xlabel('Date')
    plt.ylabel('Events')

    plt.grid(True)
    plt.tight_layout()
    plt.show()

def generate_timeline_iframe(events: Dict[str, List[int]], title: str = "Event Timeline", event_color: str = 'blue', font_size: int = 12) -> str:
    """
    Generates an HTML iframe for the event timeline.

    Args:
        events (Dict[str, List[int]]): A dictionary of events and their positions.
        title (str): The title of the timeline.
        event_color (str): The color of the event markers.
        font_size (int): The font size of the event labels.

    Returns:
        str: HTML iframe containing the timeline.
    """
    import plotly.graph_objects as go
    event_dates = sorted(events.items(), key=lambda x: x[1])

    y_pos = range(len(event_dates))
    event_labels = [event for event, _ in event_dates]
    event_times = [datetime.datetime.now() - datetime.timedelta(days=i*30) for i in range(len(event_dates))]

    fig = go.Figure(data=go.Scatter(
        x=event_times,
        y=y_pos,
        mode='lines+markers+text',
        text=event_labels,
        textposition="top center",
        marker=dict(color=event_color),
        textfont=dict(size=font_size)
    ))

    fig.update_layout(
        title=title,
        xaxis_title='Date',
        yaxis_title='Events',
        yaxis=dict(tickvals=y_pos, ticktext=event_labels, autorange='reversed'),
        template="plotly_white"
    )

    return fig.to_html(full_html=False)
