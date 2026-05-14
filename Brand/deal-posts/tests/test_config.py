from pathlib import Path
import config


def test_load_env_parses_keys(tmp_path, monkeypatch):
    env = tmp_path / ".env.local"
    env.write_text('# comment\nFOO=bar\nQUOTED="baz qux"\nEMPTYLINE=\n\nWITHEQ=a=b\n')
    monkeypatch.delenv("FOO", raising=False)
    monkeypatch.delenv("QUOTED", raising=False)
    monkeypatch.delenv("EMPTYLINE", raising=False)
    monkeypatch.delenv("WITHEQ", raising=False)
    config.load_env(env)
    import os
    assert os.environ["FOO"] == "bar"
    assert os.environ["QUOTED"] == "baz qux"
    assert os.environ["EMPTYLINE"] == ""
    assert os.environ["WITHEQ"] == "a=b"


def test_load_env_strips_inline_comments(tmp_path, monkeypatch):
    env = tmp_path / ".env.local"
    env.write_text('INLINE=value # trailing comment\nQUOTEDHASH="a # b"\n')
    monkeypatch.delenv("INLINE", raising=False)
    monkeypatch.delenv("QUOTEDHASH", raising=False)
    config.load_env(env)
    import os
    assert os.environ["INLINE"] == "value"
    assert os.environ["QUOTEDHASH"] == "a # b"  # quoted: '#' is kept


def test_load_env_does_not_overwrite_existing(tmp_path, monkeypatch):
    env = tmp_path / ".env.local"
    env.write_text("FOO=fromfile\n")
    monkeypatch.setenv("FOO", "fromshell")
    config.load_env(env)
    import os
    assert os.environ["FOO"] == "fromshell"


def test_load_env_missing_file_is_silent(tmp_path):
    config.load_env(tmp_path / "nope.env")  # must not raise
