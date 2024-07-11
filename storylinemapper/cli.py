# storylinemapper/cli.py

import click
from storylinemapper.network import generate_network
from storylinemapper.html_generator import generate_html

@click.group()
def main():
    pass

@main.command()
@click.argument('text')
@click.option('--output', default='network.html', help='Output HTML file')
@click.option('--show-actions', is_flag=True, help='Show actions on edges')
@click.option('--style', default='style1', help='CSS style file')
@click.option('--script', default='script1', help='JavaScript file for visualization')
@click.option('--width', default='960px', help='Width of the iframe')
@click.option('--height', default='600px', help='Height of the iframe')
def network(text, output, show_actions, style, script, width, height):
    G = generate_network(text)
    html_content = generate_html(G, style=style, script=script, show_actions=show_actions, width=width, height=height)
    with open(output, 'w') as f:
        f.write(html_content)
    click.echo(f'Network iframe saved to {output}')

if __name__ == '__main__':
    main()
