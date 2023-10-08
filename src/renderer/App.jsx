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

const Header = ({ isConnected, addPlotContainer, addSideBySideLayout }) => {
  return (
    <div className="shadow-sm bg-white">
      <div className="p-2 m-1 ml-8 flex justify-between">
        <div className="flex space-x-10 items-center">
          <div className="text-2xl font-semibold">Ussper Visualization</div>
          <div
            className="hover:bg-gray-500 hover:bg-opacity-20 px-3 py-2 rounded-md"
            onClick={addPlotContainer}
          >
            Add ☐
          </div>
          <div
            className="hover:bg-gray-500 hover:bg-opacity-20 px-3 py-2 rounded-md"
            onClick={addSideBySideLayout}
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

const PlotContainer = ({ id, onDelete }) => {
  const plotDivRef = useRef();

  const [spec, setSpec] = useState(null);
  const [topic, setTopic] = useState(null);
  const [title, setTitle] = useState('Select Plot');
  const [lastReceiveTimestamp, setLastReceiveTimestamp] = useState('');

  useEffect(() => {
    if (topic == null) return;

    function onTopicEvent(event) {
      if (event == null) return;

      setSpec(JSON.parse(event));
      setLastReceiveTimestamp(getCurrentTimestamp());
    }

    console.log('register for ' + topic);
    socket.on(topic, onTopicEvent);

    return () => {
      socket.off(topic, onTopicEvent);
    };
  }, [topic]);

  useEffect(() => {
    if (!spec) return;
    if (!plotDivRef.current) return;

    vegaEmbed(plotDivRef.current, spec, { actions: false });
  }, [spec]);

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
                  setSpec(null);
                  setTopic(value['value']);
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

const SideBySideLayout = ({ id, onDelete }) => {
  return (
    <div className="flex space-x-3">
      <div className="flex-1">
        <PlotContainer id={id} onDelete={onDelete} />
      </div>
      <div className="flex-1">
        <PlotContainer id={id} onDelete={onDelete} />
      </div>
    </div>
  );
};

function Main() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  const initialId = 3;
  const [currentId, setCurrentId] = useState(initialId);

  const handleDelete = (idToDelete) => {
    setLayouts((prevLayouts) =>
      prevLayouts.filter((layout) => layout.props.id !== idToDelete)
    );
  };

  const addPlotContainer = () => {
    setCurrentId((prevId) => prevId + 1);

    const newPlot = (
      <PlotContainer key={currentId} id={currentId} onDelete={handleDelete} />
    );

    setLayouts((prevLayouts) => [...prevLayouts, newPlot]);
  };

  const addSideBySideLayout = () => {
    setCurrentId((prevId) => prevId + 1);

    const newSideBySideLayout = (
      <SideBySideLayout
        key={currentId}
        id={currentId}
        onDelete={handleDelete}
      />
    );

    setLayouts((prevLayouts) => [...prevLayouts, newSideBySideLayout]);
  };

  const [layouts, setLayouts] = useState([
    <PlotContainer
      key={currentId - 3}
      id={currentId - 3}
      onDelete={handleDelete}
    />,
    <SideBySideLayout
      key={currentId - 2}
      id={currentId - 2}
      onDelete={handleDelete}
    />,
    <PlotContainer
      key={currentId - 1}
      id={currentId - 1}
      onDelete={handleDelete}
    />,
  ]);

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
        addPlotContainer={addPlotContainer}
        addSideBySideLayout={addSideBySideLayout}
      />
      <div className="flex flex-col space-y-3 m-5">{...layouts}</div>
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
