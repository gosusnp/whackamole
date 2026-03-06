import { Card } from '../components/ui/Card';
import { Columns, Column } from '../components/ui/Columns';
import { Tabs } from '../components/ui/Tabs';

export function DesignElements() {
  const tabItems = [
    {
      id: 'tab1',
      label: 'Layout',
      content: (
        <Columns>
          <Column>
            <Card title="Column 1">
              <p>This is the first column in a flexible layout.</p>
            </Card>
          </Column>
          <Column>
            <Card title="Column 2">
              <p>This is the second column in a flexible layout.</p>
            </Card>
          </Column>
        </Columns>
      ),
    },
    {
      id: 'tab2',
      label: 'Containers',
      content: (
        <Card title="Detailed Card" footer={<p>Footer content here</p>}>
          <p>Cards are the building blocks of our UI. They can have optional headers and footers.</p>
        </Card>
      ),
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Gold Standard Elements</h1>
      
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-brand-primary">Tabs & Layout</h2>
        <Tabs items={tabItems} />
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-brand-primary">Vertical Columns</h2>
        <Columns vertical>
          <Column>
            <Card title="Stack 1">
              <p>Vertical columns allow for stacking components with consistent spacing.</p>
            </Card>
          </Column>
          <Column>
            <Card title="Stack 2">
              <p>Useful for sidebars or vertical lists.</p>
            </Card>
          </Column>
        </Columns>
      </section>
    </div>
  );
}
