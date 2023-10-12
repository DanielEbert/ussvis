from __future__ import annotations

import dataclasses
from abc import ABC, abstractmethod


# TODO: likely add dirty flag
@dataclasses.dataclass
class Features:
    timestamps: list[int] = dataclasses.field(default_factory=list)
    x: list[int] = dataclasses.field(default_factory=list)
    y: list[int] = dataclasses.field(default_factory=list)
    feature_type: list[str] = dataclasses.field(default=list)

    def add(self, timestamp: int, x: int, y: int, feature_type: str) -> None:
        self.timestamps.append(timestamp)
        self.x.append(x)
        self.y.append(y)
        self.feature_type.append(feature_type)


@dataclasses.dataclass
class Datamodel:
    features: Features


class Plot(ABC):
    @abstractmethod
    def plot(self, data: Datamodel) -> str:
        ...


class FeaturePlot(Plot):
    def plot(self, data: Datamodel) -> str:
        ...
        return 'features'


class CarPlot(Plot):
    def plot(self, data: Datamodel) -> str:
        ...
        return 'car_path'


data = Datamodel()

available_plots = {
    'features': FeaturePlot(),
    'car_path': CarPlot()
}


class PlotScheduler:
    def __init__(self) -> None:
        self.plots_to_emit = set('features')

    def plot(self) -> None:
        for plot_to_emit in self.plots_to_emit:
            print(available_plots[plot_to_emit])
