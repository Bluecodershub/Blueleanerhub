import argparse

import psutil


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("port", type=int)
    args = parser.parse_args()

    found = False
    for connection in psutil.net_connections(kind="inet"):
        local = connection.laddr
        if not local or getattr(local, "port", None) != args.port:
            continue
        if connection.status != psutil.CONN_LISTEN:
            continue

        found = True
        pid = connection.pid
        process_name = "unknown"
        cmdline = []
        if pid:
            try:
                process = psutil.Process(pid)
                process_name = process.name()
                cmdline = process.cmdline()
            except Exception:
                pass

        print(f"pid={pid}")
        print(f"name={process_name}")
        print(f"address={local.ip}:{local.port}")
        print(f"cmdline={' '.join(cmdline)}")
        print("---")

    if not found:
        print("no-listener-found")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
