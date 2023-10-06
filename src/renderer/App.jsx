import { useEffect, useRef, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import vegaEmbed from 'vega-embed';
import Select from 'react-select';
import icon from '../../assets/icon.svg';
import './App.css';
import { socket } from './socket';

// TODO: later get this via event with callback
const topics = [
  { value: 'alpha', label: 'alpha', title: 'alphaHeader' },
  { value: 'beta', label: 'beta', title: 'betaHeader' },
  { value: 'gamma', label: 'gamma', title: 'gammaHeader' },
];

const Header = ({ isConnected }) => {
  return (
    <div className="shadow-sm bg-white">
      <div className="p-2 m-1 ml-8 flex justify-between">
        <div className="flex space-x-10 items-center">
          <div className="text-2xl font-semibold">Ussper Visualization</div>
          <a
            href="#"
            className="hover:bg-gray-500 hover:bg-opacity-20 px-3 py-2 rounded-md"
          >
            TODO1
          </a>
          <a
            href="#"
            className="hover:bg-gray-500 hover:bg-opacity-20 px-3 py-2 rounded-md"
          >
            TODO2
          </a>
        </div>
        <div className="mr-8 self-center">
          {isConnected ? 'Connected' : 'Not Connected'}
        </div>
      </div>
    </div>
  );
};

function Main() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  const plotDivRef = useRef();

  const [spec, setSpec] = useState(null);

  const [topic, setTopic] = useState(null);

  const [title, setTitle] = useState('Select Plot');

  useEffect(() => {
    function onConnect() {
      console.log(isConnected);
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log(isConnected);
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  useEffect(() => {
    if (topic == null) return;

    function onTopicEvent(event) {
      if (event == null) return;

      setSpec(JSON.parse(event));
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
    <>
      <Header isConnected={isConnected} />
      <div className="flex flex-col space-y-3 m-5">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-[32rem] px-4 py-2">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-semibold">{title}</div>
              <div className="text-gray-500 mb-2">16:48:52</div>
            </div>
            <div className="w-1/5">
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
          </div>
          <div className=" flex-1" ref={plotDivRef} />
        </div>
        <div className="flex space-x-3">
          <div className="flex-1 bg-white aspect-square border border-gray-200">
            A
          </div>
          <div className="flex-1 bg-white aspect-square border border-gray-200">
            B
          </div>
        </div>
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
