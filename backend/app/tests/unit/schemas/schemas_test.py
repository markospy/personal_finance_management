from datetime import datetime

import pytest  # noqa: F401

from ....schemas.schemas import Period


@pytest.fixture
def wrong_interval():
    start_date = datetime(year=2024, month=12, day=15, hour=21, minute=11, second=23)
    end_date = datetime(year=2024, month=10, day=14, hour=20, minute=10, second=23)
    return start_date, end_date


@pytest.fixture
def right_interval():
    start_date = datetime(year=2024, month=10, day=15, hour=21, minute=11, second=23)
    end_date = datetime(year=2024, month=12, day=14, hour=20, minute=10, second=23)
    return start_date, end_date


@pytest.mark.schemas
def test_period_generate_excepcion(wrong_interval):
    with pytest.raises(ValueError, match="Start date must be before end date"):
        Period(start_date=wrong_interval[0], end_date=wrong_interval[1])


@pytest.mark.schemas
def test_period_right(right_interval):
    period = Period(start_date=right_interval[0], end_date=right_interval[1])
    assert period.start_date == datetime(2024, 10, 15, hour=21, minute=11, second=23, microsecond=0, tzinfo=None)
    assert period.end_date == datetime(2024, 12, 14, hour=20, minute=10, second=23, microsecond=0, tzinfo=None)
