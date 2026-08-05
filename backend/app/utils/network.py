import socket
import urllib.request
import logging

logger = logging.getLogger("dsrs_sync_engine")


def is_connected(host: str = "8.8.8.8", port: int = 53, timeout: float = 3.0) -> bool:
    """
    Check if an active internet connection is available using a fast socket check
    with an HTTP fallback.

    :param host: Target host IP for DNS ping (default: 8.8.8.8 Google DNS)
    :param port: Target port (default: 53)
    :param timeout: Connection timeout in seconds (default: 3.0s)
    :return: True if internet connection is verified, False otherwise
    """
    try:
        # Primary check: Quick socket connection to Google DNS
        socket.setdefaulttimeout(timeout)
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.connect((host, port))
            return True
    except Exception:
        pass

    try:
        # Secondary fallback check: Lightweight HTTP GET to Cloudflare DNS
        with urllib.request.urlopen("https://1.1.1.1", timeout=timeout) as response:
            if response.status == 200:
                return True
    except Exception:
        pass

    return False
