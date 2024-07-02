# storylinemapper/cli.py

import argparse
import sys
from storylinemapper import (
    generate_network, generate_network_iframe,
    extract_events, generate_timeline_iframe
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
    network_parser.add_argument("--show-actions", action="store_true", help="Show action verbs on edges")
    network_parser.add_argument("--style", type=str, default="style1", help="CSS style to use")
    network_parser.add_argument("--script", type=str, default="script1", help="D3 script to use")
    network_parser.add_argument("--width", type=str, default="960px", help="Width of the iframe")
    network_parser.add_argument("--height", type=str, default="600px", help="Height of the iframe")

    # Subparser for event timeline
    timeline_parser = subparsers.add_parser("timeline", help="Generate event timeline")
    timeline_parser.add_argument("text", type=str, help="Input text")
    timeline_parser.add_argument("--output", type=str, help="Output file for iframe (optional)")
    timeline_parser.add_argument("--width", type=str, default="960px", help="Width of the iframe")
    timeline_parser.add_argument("--height", type=str, default="600px", help="Height of the iframe")

    return parser.parse_args()

def main():
    args = parse_args()

    if args.command == "network":
        text = args.text
        G = generate_network(text)
        if args.output:
            iframe_html = generate_network_iframe(G, style=args.style, script=args.script, show_actions=args.show_actions, width=args.width, height=args.height)
            with open(args.output, 'w') as f:
                f.write(iframe_html)
            print(f"Network iframe saved to {args.output}")

    elif args.command == "timeline":
        text = args.text
        events = extract_events(text)
        if args.output:
            iframe_html = generate_timeline_iframe(events, width=args.width, height=args.height)
            with open(args.output, 'w') as f:
                f.write(iframe_html)
            print(f"Timeline iframe saved to {args.output}")

if __name__ == "__main__":
    main()
