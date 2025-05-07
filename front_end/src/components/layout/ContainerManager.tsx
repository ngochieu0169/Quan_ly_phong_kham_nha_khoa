
function ContainerManager({ children }: any) {
    return (
      <div>
        <div className="container">
          {/* <TheHeader /> */}
          <div className="content">{children}</div>
        </div>
      </div>
    );
  }
  
  export default ContainerManager;
  