#!/usr/bin/env python3
"""a cut-down version of update_historical_tech_and_upgrade_breakdown() that processes the current checkout"""

import logging

from adhoc_tools import generate_state_breakdown, print_breakdowns, update_breakdown

if __name__ == "__main__":  # pragma: no cover
    logging.basicConfig(level=logging.INFO)
    bd = update_breakdown()
    print_breakdowns(bd)
    generate_state_breakdown()
