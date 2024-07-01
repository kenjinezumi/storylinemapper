# storylinemapper/cli.py

import argparse
import sys
from storylinemapper import (
    extract_entities, extract_relations, generate_network, draw_network, generate_network_iframe,
    extract_events, generate_timeline, generate_timeline_iframe
)
import spacy

nlp = spacy.load("en_core_web_sm")

def parse_args():
    parser = argparse.ArgumentParser(description="StorylineMapper CLI")
    subparsers = parser.add_subparsers(dest="command")

    # Subparser for character network
    network_parser = subparsers.add_parser("network", help="Generate character network")
    network_parser.add_argument("text", type=str, help="Input text")
    network_parser.add_argument("--output", type=str, help="Output file for iframe (optional)")

    # Subparser for event timeline
    timeline_parser = subparsers.add_parser("timeline", help="Generate event timeline")
    timeline_parser.add_argument("text", type=str, help="Input text")
    timeline_parser.add_argument("--output", type=str, help="Output file for iframe (optional)")

    return parser.parse_args()

def main():
    args = parse_args()

    if args.command == "network":
        text = args.text
        G = generate_network(text)
        if args.output:
            iframe_html = generate_network_iframe(G)
            with open(args.output, 'w') as f:
                f.write(iframe_html)
            print(f"Network iframe saved to {args.output}")
        else:
            draw_network(G)

    elif args.command == "timeline":
        text = args.text
        events = extract_events(text)
        if args.output:
            iframe_html = generate_timeline_iframe(events)
            with open(args.output, 'w') as f:
                f.write(iframe_html)
            print(f"Timeline iframe saved to {args.output}")
        else:
            generate_timeline(events)

if __name__ == "__main__":
    main()
