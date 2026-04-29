import { DOMAIN_COMPONENTS } from "../data/domains";

export default function DomainLibrary({ onLoadTemplate, onAddByClick }) {
  return (
    <section className="panel toolbarPanel">
      <h2>Component Toolbar</h2>
      <div className="templateRow toolbarTemplates">
        <button onClick={() => onLoadTemplate("3-tier web app")}>Web App</button>
        <button onClick={() => onLoadTemplate("secure event pipeline")}>Secure Pipeline</button>
      </div>
      <p className="helperText">Drag to workspace or click to place.</p>
      <div className="domainBlocks">
        {DOMAIN_COMPONENTS.map((group) => (
          <div key={group.domain} className="domainGroup">
            <h3>{group.domain}</h3>
            <div className="library">
              {group.items.map((item) => (
                <button
                  key={item.kind}
                  className="libraryCard"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData(
                      "application/case-component",
                      JSON.stringify({ ...item, domain: group.domain })
                    );
                    event.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => onAddByClick({ ...item, domain: group.domain })}
                >
                  <span>{item.icon}</span>
                  <div>
                    <strong>{item.kind}</strong>
                    <small>{item.description}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
