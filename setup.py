from setuptools import setup, find_packages

with open("requirements.txt") as f:
    install_requires = f.read().strip().split("\n")

from aura_theme import __version__ as version

setup(
    name="aura_theme",
    version=version,
    description="Modern SaaS theme for Frappe and ERPNext V15",
    author="Yousef Ashraf",
    author_email="yousefmohamed202@outlook.com",
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=install_requires
)
