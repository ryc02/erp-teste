from venner_desktop.modules import PRODUTIVIDADE_MODULE
from venner_desktop.runtime import launch_web_module


def main() -> int:
    return launch_web_module(PRODUTIVIDADE_MODULE)


if __name__ == "__main__":
    raise SystemExit(main())
