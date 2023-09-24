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

function Main() {
  const plotDivRef = useRef();

  const [spec, setSpec] = useState(null);

  useEffect(() => {
    window.electron.ipcRenderer.on('echo_plot', (data) => {
      console.log('recvd data:', data);

      setSpec(JSON.parse(data));

      // if (plotDivRef.current) {
      //   // Embed the visualization in the container
      //   vegaEmbed(plotDivRef.current, JSON.parse(data), { actions: false });
      // }
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
    <div className="h-[calc(100vh-74px)] prose flex flex-col">
      <div className="shadow-sm">
        <div className="p-2 mb-2 ml-4 flex items-center justify-left w-full space-x-10">
          <div className="text-2xl">Ussper Visualization</div>
          <a
            href="#"
            className="hover:bg-gray-500 hover:bg-opacity-20 px-3 py-2 rounded-md"
          >
            Findings
          </a>
          <a
            href="#"
            className="hover:bg-gray-500 hover:bg-opacity-20 px-3 py-2 rounded-md"
          >
            Fuzzer Stats
          </a>
        </div>
      </div>
      <div className="flex-1" ref={plotDivRef}></div>
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
