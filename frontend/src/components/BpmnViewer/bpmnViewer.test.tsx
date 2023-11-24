import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import { BpmnViewer } from './BpmnViewer';
// import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';
// import Viewer from 'bpmn-js/lib/Viewer';
// import { mocked } from 'jest-mock';

interface ViewerInterface {
  importXML: (xml: string) => Promise<any>;
  destroy: () => void;
  get: (module: string) => any;
}

jest.mock('bpmn-js/lib/NavigatedViewer', () => {
  class MockNavigatedViewer implements ViewerInterface {
    options: Record<string, unknown>;
    constructor(options: Record<string, unknown>) {
    this.options = options}

    importXML = jest.fn().mockResolvedValue({ warnings: [] });
    destroy = jest.fn();
    get = jest.fn().mockReturnValue({
      viewbox: () => ({ inner: {}, outer: {} }),
      zoom: jest.fn(),
    });
    // Expose the mock function for tests
  }
  return { default: MockNavigatedViewer }
});

jest.mock('bpmn-js/lib/Viewer', () => {
  class MockViewer implements ViewerInterface {
    options: Record<string, unknown>;
    constructor(options: Record<string, unknown>) {
    this.options = options}
  
    importXML = jest.fn().mockResolvedValue({ warnings: [] });
    destroy = jest.fn();
    get = jest.fn().mockReturnValue({
      viewbox: () => ({ inner: {}, outer: {} }),
      zoom: jest.fn(),
    });
  }
  return { default: MockViewer };
});


describe('BpmnViewer Component', () => {
  it('should match the snapshot', () => {
    const bpmnString = 'some-bpmn-xml-string';
    const { asFragment } = render(<BpmnViewer bpmnString={bpmnString} navigated={true} />);

    expect(asFragment()).toMatchSnapshot();
  });
  it('renders and initializes bpmn-js viewer', async () => {
    const bpmnString = 'some-bpmn-xml-string';
    
    // Render the component
    const { getByTestId } = render(<BpmnViewer bpmnString={bpmnString} navigated={true} />);

    await waitFor(() => {
      expect(getByTestId('canvas')).toBeInTheDocument();
    });
  });

  // it('uses NavigatedViewer when navigated prop is true', async () => {
  //   const bpmnString = 'some-bpmn-xml-string';
  //   render(<BpmnViewer bpmnString={bpmnString} navigated={true} />);
  
  //   await waitFor(() => {
  //     // Ensure the constructor for NavigatedViewer was called
  //     const mockedNavigatedViewer = mocked(NavigatedViewer, true);
  //     expect(mockedNavigatedViewer).toHaveBeenCalledTimes(1);
  //   });
  // });

  // it('uses Viewer when navigated prop is false', async () => {
  //   const bpmnString = 'some-bpmn-xml-string';
  //   render(<BpmnViewer bpmnString={bpmnString} navigated={true} />);
  
  //   await waitFor(() => {
  //     expect(Viewer).toHaveBeenCalled();
  //   });
  // });

  // it('imports BPMN string correctly', async () => {
  //   const bpmnString = 'some-bpmn-xml-string';
  //   render(<BpmnViewer bpmnString={bpmnString} navigated={true} />);
  
  //   await waitFor(() => {
  //     const mockNavigatedViewer = NavigatedViewer as jest.MockedClass<typeof NavigatedViewer>;
  //     expect(mockNavigatedViewer.mock.instances[0].importXML).toHaveBeenCalledWith(bpmnString);
  //   });
  // });
});