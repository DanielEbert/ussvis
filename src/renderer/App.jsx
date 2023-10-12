import { useEffect, useRef, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import vegaEmbed from 'vega-embed';
import Select from 'react-select';
import icon from '../../assets/icon.svg';
import './App.css';
import { socket } from './socket';
import { BsWifiOff } from 'react-icons/bs';
import { AiOutlineWifi } from 'react-icons/ai';
import { ImCancelCircle } from 'react-icons/im';
import { v4 as uuid } from 'uuid';

// TODO: later get this via event with callback
const topics = [
  { value: 'alpha', label: 'alpha', title: 'alphaHeader' },
  { value: 'beta', label: 'beta', title: 'betaHeader' },
  { value: 'gamma', label: 'gamma', title: 'gammaHeader' },
];

const getCurrentTimestamp = () => {
  const now = new Date();

  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getUTCMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');

  return `${hour}:${minute}:${second}`;
};

const Header = ({ isConnected, addSinglePlot, addSideBySidePlots }) => {
  return (
    <div className="shadow-sm bg-white">
      <div className="p-2 m-1 ml-8 flex justify-between">
        <div className="flex space-x-10 items-center">
          <div className="text-2xl font-semibold">Ussper Visualization</div>
          <div
            className="hover:bg-gray-500 hover:bg-opacity-20 px-3 py-2 rounded-md"
            onClick={addSinglePlot}
          >
            Add ☐
          </div>
          <div
            className="hover:bg-gray-500 hover:bg-opacity-20 px-3 py-2 rounded-md"
            onClick={addSideBySidePlots}
          >
            Add ☐☐
          </div>
        </div>
        <div className="mr-8 items-center flex space-x-2">
          <div>{isConnected ? 'Connected' : 'Not Connected'}</div>
          {isConnected ? <AiOutlineWifi /> : <BsWifiOff />}
        </div>
      </div>
    </div>
  );
};

const PlotContainer = ({
  id,
  topic,
  setTopic,
  topicIndex,
  onDelete,
  spec,
  lastReceiveTimestamp,
}) => {
  const plotDivRef = useRef();

  const [title, setTitle] = useState('Select Plot');

  if (spec && plotDivRef.current) {
    vegaEmbed(plotDivRef.current, spec, { actions: false });
  }

  if (!plotDivRef.current) {
    console.log('No ref set.');
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-[32rem] pl-4 pr-2 py-2">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="text-2xl font-semibold">{title}</div>
          <div className="text-gray-500 mb-2">{lastReceiveTimestamp}</div>
        </div>
        <div className="w-1/3">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Select
                options={topics}
                onChange={(value) => {
                  if (plotDivRef.current) {
                    plotDivRef.current.innerHTML = '';
                  }
                  setTopic(id, value['value'], topicIndex);
                  setTitle(value['title']);
                }}
              />
            </div>
            <div
              className="hover:bg-gray-500 hover:bg-opacity-20 p-2 rounded-md"
              onClick={() => onDelete(id)}
            >
              <ImCancelCircle size={20} />
            </div>
          </div>
        </div>
      </div>
      <div className=" flex-1" ref={plotDivRef} />
    </div>
  );
};

function Main() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  const [plots, setPlots] = useState([
    {
      id: uuid(),
      layoutType: 'single',
      topics: [''],
      plotSpecs: [null],
      lastReceiveTimestamp: [null],
    },
    {
      id: uuid(),
      layoutType: 'sideBySide',
      topics: ['', ''],
      plotSpecs: [null, null],
      lastReceiveTimestamp: [null, null],
    },
    {
      id: uuid(),
      layoutType: 'single',
      topics: [''],
      plotSpecs: [null],
      lastReceiveTimestamp: [null],
    },
  ]);

  useEffect(() => {
    function onEvent(topicName, ...args) {
      setPlots((prevPlots) =>
        prevPlots.map((plot) => {
          for (var index = 0; index < plot.topics.length; index++) {
            const topic = plot.topics[index];
            if (topicName == topic) {
              const updatedPlotSpecs = [...plot.plotSpecs];
              updatedPlotSpecs[index] = JSON.parse(args[0]);

              const updatedLastReceiveTimestamp = [
                ...plot.lastReceiveTimestamp,
              ];
              updatedLastReceiveTimestamp[index] = getCurrentTimestamp();

              plot = {
                ...plot,
                plotSpecs: updatedPlotSpecs,
                lastReceiveTimestamp: updatedLastReceiveTimestamp,
              };
            }
          }
          return plot;
        })
      );
    }

    socket.onAny(onEvent);

    return () => {
      socket.offAny(onEvent);
    };
  }, []);

  const setTopic = (id, newTitle, index = 0) => {
    setPlots((prevPlots) =>
      prevPlots.map((plot) => {
        if (plot.id == id) {
          const updatedTopics = [...plot.topics];
          updatedTopics[index] = newTitle;
          return { ...plot, topics: updatedTopics };
        }
        return plot;
      })
    );
  };

  const deletePlot = (idToDelete) => {
    setPlots((prevPlots) => prevPlots.filter((plot) => plot.id !== idToDelete));
  };

  const addSinglePlot = () => {
    setPlots((prevPlots) => [
      ...prevPlots,
      {
        id: uuid(),
        layoutType: 'single',
        topics: [''],
        plotSpecs: [null],
      },
    ]);
  };

  const addSideBySidePlots = () => {
    setPlots((prevPlots) => [
      ...prevPlots,
      {
        id: uuid(),
        layoutType: 'sideBySide',
        topics: ['', ''],
        plotSpecs: [null, null],
      },
    ]);
  };

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <>
      <Header
        isConnected={isConnected}
        addSinglePlot={addSinglePlot}
        addSideBySidePlots={addSideBySidePlots}
      />
      <div className="flex flex-col space-y-3 m-5">
        {plots.map((plot) =>
          plot.layoutType == 'single' ? (
            <PlotContainer
              key={plot.id}
              id={plot.id}
              topic={plot.topics[0]}
              setTopic={setTopic}
              topicIndex={0}
              onDelete={deletePlot}
              spec={plot.plotSpecs[0]}
              lastReceiveTimestamp={plot.lastReceiveTimestamp[0]}
            />
          ) : (
            <div className="flex space-x-3">
              <div className="flex-1">
                <PlotContainer
                  key={plot.id}
                  id={plot.id}
                  topic={plot.topics[0]}
                  setTopic={setTopic}
                  topicIndex={0}
                  onDelete={deletePlot}
                  spec={plot.plotSpecs[0]}
                  lastReceiveTimestamp={plot.lastReceiveTimestamp[0]}
                />
              </div>
              <div className="flex-1">
                <PlotContainer
                  key={plot.id}
                  id={plot.id}
                  topic={plot.topics[1]}
                  setTopic={setTopic}
                  topicIndex={1}
                  onDelete={deletePlot}
                  spec={plot.plotSpecs[1]}
                  lastReceiveTimestamp={plot.lastReceiveTimestamp[1]}
                />
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  );
}
