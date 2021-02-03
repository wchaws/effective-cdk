#!/usr/bin/env python3
import os
import re
import sys
import textwrap
import subprocess


def sh(*args):
    return subprocess.check_output(*args, shell=True).decode()


def cat(*s, delimiter='\n'):
    return delimiter.join(s)


def renderf(filename, basedir=os.curdir):
    lang = os.path.splitext(filename)[1][1:]
    show = False
    head = []
    desc = []
    tree = []
    body = []
    with open(filename) as fp:
        for line in fp:
            if re.search(r'^\s*/// !show', line, re.MULTILINE):
                show = True
                continue
            if re.search(r'^\s*/// !hide', line, re.MULTILINE):
                show = False
                continue
            if re.search(r'^\s*/// !tree', line, re.MULTILINE):
                tree = [
                    '```',
                    sh(f'cd {os.path.dirname(filename)} && tree -L 3 -F .').rstrip(),
                    '```',
                ]
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
        *head,
        *desc,
        *tree,
        *(
            f'```{lang}',
            textwrap.dedent(cat(*body)),
            '```',
            f'<small>more details [{os.path.basename(filename)}]({os.path.relpath(filename, basedir)})</small>',
        ) if len(body) else '',
        '',
    )


def _render(path, basedir=os.curdir, level=3):
    if os.path.isfile(path):
        yield renderf(path, basedir)
    if os.path.isdir(path) and (level > 0):
        for p in map(lambda f: os.path.join(path, f), sorted(os.listdir(path))):
            for s in _render(p, basedir, level-1):
                if s:
                    yield s


def render(path, basedir=os.curdir, level=3):
    return cat(*_render(path, basedir, level))


def main():
    dir = os.path.abspath(sys.argv[1])
    out = os.path.abspath(sys.argv[2])

    files = map(lambda f: os.path.join(dir, f), sorted(os.listdir(dir)))
    with open(out, 'w') as fp:
        for each in files:
            fp.write(render(each, basedir=os.path.dirname(out)))
            fp.write('\n')


if __name__ == '__main__':
    main()
