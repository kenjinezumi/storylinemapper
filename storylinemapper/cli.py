import click
from storylinemapper.network import generate_network
from storylinemapper.html_generator import generate_html
from storylinemapper.community_analysis.community import build_network_from_text, run_community_detection, name_communities

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
@click.option('--design-options', is_flag=True, help='Include design options in the output')
def network(text, output, show_actions, style, script, width, height, design_options):
    G = generate_network(text)
    html_content = generate_html(G, {}, {}, style=style, script=script, show_actions=show_actions, width=width, height=height, design_options=design_options)
    with open(output, 'w') as f:
        f.write(html_content)
    click.echo(f'Network iframe saved to {output}')

@main.command()
@click.argument('text')
@click.option('--method', default='louvain', help='Community detection method', type=click.Choice(['louvain', 'infomap', 'girvan_newman', 'label_propagation', 'asyn_fluidc'], case_sensitive=False))
@click.option('--k', default=5, help='Number of communities for Girvan-Newman or Asynchronous Fluid Communities method')
@click.option('--output', default='community_network.html', help='Output HTML file')
@click.option('--show-actions', is_flag=True, help='Show actions on edges')
@click.option('--style', default='style1', help='CSS style file')
@click.option('--script', default='script1', help='JavaScript file for visualization')
@click.option('--width', default='960px', help='Width of the iframe')
@click.option('--height', default='600px', help='Height of the iframe')
@click.option('--design-options', is_flag=True, help='Include design options in the output')
def community_detection(text, method, k, output, show_actions, style, script, width, height, design_options):
    G = build_network_from_text(text)
    partition = run_community_detection(G, method, k=k)
    community_names = name_communities(G, partition)
    html_content = generate_html(G, partition, community_names, style=style, script=script, show_actions=show_actions, width=width, height=height, design_options=design_options)
    with open(output, 'w') as f:
        f.write(html_content)
    click.echo(f'Community detection network iframe saved to {output}')

if __name__ == '__main__':
    main()
