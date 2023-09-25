import { useEffect, useRef, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import vegaEmbed from 'vega-embed';
import icon from '../../assets/icon.svg';
import './App.css';

const plot = {
  config: { view: { continuousWidth: 300, continuousHeight: 300 } },
  data: { name: 'data-aa3182f56440339a609f07b5a9bd1428' },
  mark: { type: 'point' },
  encoding: {
    x: { field: 'timestamps', title: 'Timestamp', type: 'quantitative' },
    y: {
      field: 'echo_distances',
      title: 'Echo Distance',
      type: 'quantitative',
    },
  },
  params: [
    {
      name: 'param_11',
      select: { type: 'interval', encodings: ['x', 'y'] },
      bind: 'scales',
    },
  ],
  $schema: 'https://vega.github.io/schema/vega-lite/v5.14.1.json',
  datasets: {
    'data-aa3182f56440339a609f07b5a9bd1428': [
      { echo_distances: 120, timestamps: 1 },
      { echo_distances: 150, timestamps: 2 },
      { echo_distances: 160, timestamps: 3 },
    ],
  },
};

const Header = () => {
  return (
    <div className="shadow-sm bg-white">
      <div className="p-2 m-1 ml-8 flex items-center justify-left space-x-10">
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
    </div>
  );
};

function Main() {
  const plotDivRef = useRef();

  const [spec, setSpec] = useState(null);

  useEffect(() => {
    window.electron.ipcRenderer.on('echo_plot', (data) => {
      setSpec(JSON.parse(data));
    });
  });

  useEffect(() => {
    if (!spec) return;
    if (!plotDivRef.current) return;

    const renderSpec = () =>
      vegaEmbed(plotDivRef.current, spec, { actions: false });

    renderSpec();

    // const resizeObserver = new ResizeObserver(renderSpec);
    // resizeObserver.observe(plotDivRef.current);
    // return () => {
    //   resizeObserver.disconnect();
    // };
  }, [spec]);

  return (
    <div className="h-[calc(100vh-74px)] prose flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1">
        <div className="flex flex-col space-y-3 m-5">
          <div className="bg-white h-[32rem] p-1 rounded-lg border border-gray-200">
            <div className="h-full w-full" ref={plotDivRef} />
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
      </div>
    </div>
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
