# setup.py

from setuptools import setup, find_packages

setup(
    name="storylinemapper",
    version="0.3.2",
    description="A library to generate networks of characters and timelines based on text",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="Kenji Tsuchiya",
    author_email="kenjitsuchiya1@gmail.com",
    url="https://github.com/kenjinezumi/storylinemapper",
    packages=find_packages(),
    install_requires=[
        "networkx>=2.6,<3.0",
        "matplotlib>=3.4,<4.0",
        "spacy>=3.5,<4.0",
        "plotly>=5.0,<6.0",
        "numpy>=1.15.0",
        "scikit-learn>=1.2,<2.0",
        "python-louvain>=0.16",
       "infomap>=1.5.0,<2.0",
        "community",
        "infomap"
    ],
    entry_points={
        "console_scripts": [
            "storylinemapper=storylinemapper.cli:main",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.12",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.12',
)
