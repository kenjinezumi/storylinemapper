# setup.py

from setuptools import setup, find_packages

setup(
    name="storylinemapper",
    version="0.2.0",
    description="A library to generate networks of characters and timelines based on text",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="Your Name",
    author_email="your.email@example.com",
    url="https://github.com/yourusername/storylinemapper",
    packages=find_packages(),
    install_requires=[
        "networkx",
        "matplotlib",
        "spacy",
        "plotly",
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.12",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.12',
)
