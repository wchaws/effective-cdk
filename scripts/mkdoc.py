#!/usr/bin/env python3
import os
import re
import sys
import textwrap


DIR = os.path.abspath(sys.argv[1])
OUT = os.path.abspath(sys.argv[2])


def cat(*s, delimiter='\n'):
    return delimiter.join(s)


def render(filename, basedir=os.curdir):
    lang = os.path.splitext(filename)[1][1:]
    show = False
    head = []
    desc = []
    body = []
    with open(filename) as fp:
        for line in fp:
            if re.search(r'^\s*/// !show', line, re.MULTILINE):
                show = True
                continue
            if re.search(r'^\s*/// !hide', line, re.MULTILINE):
                show = False
                continue
            m = re.search(r'^\s*/// !title\s+(.*)', line, re.MULTILINE)
            if m:
                head.append(m.group(1))
                continue
            m = re.search(r'^\s*/// !description\s+(.*)', line, re.MULTILINE)
            if m:
                desc.append(m.group(1))
                continue
            if show:
                body.append(line.rstrip())
    return cat(
        cat(*head),
        cat(*desc),
        '',
        f'see details [{os.path.basename(filename)}]({os.path.relpath(filename, basedir)})\n',
        *(
            f'```{lang}',
            textwrap.dedent(cat(*body)),
            '```'
        ) if len(body) else '',
        '---'
    )


for fname in map(lambda f: os.path.join(DIR, f), os.listdir(DIR)):
    with open(OUT, 'w') as fp:
        fp.write(render(fname, basedir=os.path.dirname(OUT)))
