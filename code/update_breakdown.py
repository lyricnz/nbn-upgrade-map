#!/usr/bin/env python3
"""a cut-down version of update_historical_tech_and_upgrade_breakdown() that processes the current checkout"""

import logging

from tabulate import tabulate

from adhoc_tools import generate_state_breakdown, update_breakdown


def print_breakdowns(breakdowns):
    """Dump the breakdowns to the console as tables."""
    for key in {"tech", "upgrade"}:
        rows = [{"date": run_date} | breakdowns[run_date][key] for run_date in sorted(breakdowns)]
        print()
        print(tabulate(rows, headers="keys", tablefmt="github"))


if __name__ == "__main__":  # pragma: no cover
    logging.basicConfig(level=logging.INFO)
    bd = update_breakdown()
    print_breakdowns(bd)
    generate_state_breakdown()
