#!/usr/bin/env python3
import os
import re
import sys
import textwrap


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
        *head,
        *desc,
        *(
            f'```{lang}',
            textwrap.dedent(cat(*body)),
            '```',
            f'<small>more details [{os.path.basename(filename)}]({os.path.relpath(filename, basedir)})</small>',
        ) if len(body) else '',
        '',
    )


def main():
    dir = os.path.abspath(sys.argv[1])
    out = os.path.abspath(sys.argv[2])

    files = map(lambda f: os.path.join(dir, f), sorted(os.listdir(dir)))
    with open(out, 'w+') as fp:
        for each in files:
            fp.write(render(each, basedir=os.path.dirname(out)))
            fp.write('\n')


if __name__ == '__main__':
    main()
