import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Component {
  id: string;
  name: string;
  type: 'cpu' | 'gpu' | 'ram' | 'motherboard' | 'storage' | 'psu' | 'case';
  price: number;
  socket?: string;
  ramType?: string;
  wattage?: number;
  compatibility: string[];
}

const components: Component[] = [
  { id: '1', name: 'Intel Core i7-13700K', type: 'cpu', price: 35000, socket: 'LGA1700', compatibility: ['LGA1700'] },
  { id: '2', name: 'AMD Ryzen 7 7700X', type: 'cpu', price: 32000, socket: 'AM5', compatibility: ['AM5'] },
  { id: '3', name: 'NVIDIA RTX 4070', type: 'gpu', price: 55000, wattage: 200, compatibility: [] },
  { id: '4', name: 'AMD RX 7800 XT', type: 'gpu', price: 50000, wattage: 263, compatibility: [] },
  { id: '5', name: 'Corsair 32GB DDR5', type: 'ram', price: 12000, ramType: 'DDR5', compatibility: ['DDR5'] },
  { id: '6', name: 'Kingston 32GB DDR4', type: 'ram', price: 8000, ramType: 'DDR4', compatibility: ['DDR4'] },
  { id: '7', name: 'ASUS Z790-A', type: 'motherboard', price: 25000, socket: 'LGA1700', ramType: 'DDR5', compatibility: ['LGA1700', 'DDR5'] },
  { id: '8', name: 'MSI B650 GAMING', type: 'motherboard', price: 18000, socket: 'AM5', ramType: 'DDR5', compatibility: ['AM5', 'DDR5'] },
  { id: '9', name: 'Samsung 1TB NVMe', type: 'storage', price: 8000, compatibility: [] },
  { id: '10', name: 'Corsair 750W 80+ Gold', type: 'psu', price: 12000, wattage: 750, compatibility: [] },
  { id: '11', name: 'NZXT H510', type: 'case', price: 7000, compatibility: [] },
];

const prebuiltConfigs = [
  {
    id: 'gaming-pro',
    name: 'Игровой Про',
    description: 'Идеальная сборка для AAA игр в 1440p',
    price: 150000,
    specs: ['Intel Core i7-13700K', 'NVIDIA RTX 4070', '32GB DDR5', '1TB NVMe'],
    image: '🎮'
  },
  {
    id: 'workstation',
    name: 'Рабочая Станция',
    description: 'Мощная система для работы и рендеринга',
    price: 180000,
    specs: ['AMD Ryzen 7 7700X', 'NVIDIA RTX 4070', '32GB DDR5', '1TB NVMe'],
    image: '💼'
  },
  {
    id: 'budget-gaming',
    name: 'Бюджетный Игровой',
    description: 'Оптимальная производительность за свои деньги',
    price: 95000,
    specs: ['AMD Ryzen 7 7700X', 'AMD RX 7800 XT', '32GB DDR4', '1TB NVMe'],
    image: '⚡'
  },
];

export default function Index() {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedComponents, setSelectedComponents] = useState<{ [key: string]: Component }>({});
  const [isRegistered, setIsRegistered] = useState(false);
  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
  const [compareConfigs, setCompareConfigs] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const checkCompatibility = () => {
    const selected = Object.values(selectedComponents);
    if (selected.length < 2) return { compatible: true, warnings: [] };

    const warnings: string[] = [];
    const cpu = selected.find(c => c.type === 'cpu');
    const motherboard = selected.find(c => c.type === 'motherboard');
    const ram = selected.find(c => c.type === 'ram');
    const gpu = selected.find(c => c.type === 'gpu');
    const psu = selected.find(c => c.type === 'psu');

    if (cpu && motherboard) {
      if (cpu.socket !== motherboard.socket) {
        warnings.push(`❌ Процессор ${cpu.socket} несовместим с материнской платой ${motherboard.socket}`);
      }
    }

    if (ram && motherboard) {
      if (ram.ramType !== motherboard.ramType) {
        warnings.push(`❌ Память ${ram.ramType} несовместима с материнской платой ${motherboard.ramType}`);
      }
    }

    if (gpu && psu) {
      const totalWattage = (gpu.wattage || 0) + 150;
      if (totalWattage > (psu.wattage || 0)) {
        warnings.push(`⚠️ Мощность БП может быть недостаточной. Рекомендуется минимум ${totalWattage}W`);
      }
    }

    return { compatible: warnings.length === 0, warnings };
  };

  const toggleComponent = (component: Component) => {
    setSelectedComponents(prev => {
      const newSelected = { ...prev };
      if (newSelected[component.type]) {
        delete newSelected[component.type];
      } else {
        newSelected[component.type] = component;
      }
      return newSelected;
    });
  };

  const getTotalPrice = () => {
    return Object.values(selectedComponents).reduce((sum, comp) => sum + comp.price, 0);
  };

  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistered(true);
    toast.success('Регистрация успешна! Теперь вы можете собрать свой ПК');
  };

  const toggleCompare = (configId: string) => {
    setCompareConfigs(prev => {
      if (prev.includes(configId)) {
        return prev.filter(id => id !== configId);
      }
      if (prev.length >= 3) {
        toast.error('Можно сравнить максимум 3 конфигурации');
        return prev;
      }
      return [...prev, configId];
    });
  };

  const comparedConfigs = prebuiltConfigs.filter(config => compareConfigs.includes(config.id));

  const compatibility = checkCompatibility();

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Cpu" size={28} className="text-primary" />
            <h1 className="text-2xl font-bold text-secondary">Сбор ПК</h1>
          </div>
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveSection('home')}
              className={`text-sm font-medium transition-colors ${
                activeSection === 'home' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Главная
            </button>
            <button
              onClick={() => setActiveSection('catalog')}
              className={`text-sm font-medium transition-colors ${
                activeSection === 'catalog' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Каталог
            </button>
            <button
              onClick={() => setActiveSection('configurator')}
              className={`text-sm font-medium transition-colors ${
                activeSection === 'configurator' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Конфигуратор
            </button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant={isRegistered ? "outline" : "default"}>
                  <Icon name={isRegistered ? "UserCheck" : "User"} size={16} className="mr-2" />
                  {isRegistered ? userData.name : 'Войти'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Регистрация</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleRegistration} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Имя</Label>
                    <Input
                      id="name"
                      required
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      placeholder="Иван Иванов"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      placeholder="ivan@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      required
                      value={userData.phone}
                      onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                  <Button type="submit" className="w-full">Зарегистрироваться</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </nav>

      {activeSection === 'home' && (
        <div className="animate-fade-in">
          <section className="py-32 px-6">
            <div className="container mx-auto text-center max-w-4xl">
              <h2 className="text-6xl font-bold mb-6 text-secondary leading-tight">
                Собери компьютер своей мечты
              </h2>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                Профессиональная сборка и продажа игровых компьютеров с проверкой совместимости комплектующих
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setActiveSection('configurator')}
                  className="text-lg px-8"
                >
                  <Icon name="Wrench" size={20} className="mr-2" />
                  Собрать ПК
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setActiveSection('catalog')}
                  className="text-lg px-8"
                >
                  <Icon name="Package" size={20} className="mr-2" />
                  Готовые сборки
                </Button>
              </div>
            </div>
          </section>

          <section className="py-20 px-6 bg-muted/30">
            <div className="container mx-auto">
              <h3 className="text-4xl font-bold text-center mb-16 text-secondary">Преимущества</h3>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: 'Shield',
                    title: 'Проверка совместимости',
                    description: 'Автоматическая проверка всех комплектующих на совместимость',
                  },
                  {
                    icon: 'Award',
                    title: 'Гарантия качества',
                    description: 'Все компоненты от официальных поставщиков с гарантией',
                  },
                  {
                    icon: 'Headphones',
                    title: 'Поддержка 24/7',
                    description: 'Консультации по выбору и настройке компьютера',
                  },
                ].map((feature, idx) => (
                  <Card key={idx} className="p-8 hover:shadow-lg transition-shadow animate-scale-in">
                    <Icon name={feature.icon as any} size={48} className="text-primary mb-4" />
                    <h4 className="text-xl font-semibold mb-3 text-secondary">{feature.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {activeSection === 'catalog' && (
        <div className="py-16 px-6 animate-fade-in">
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold mb-4 text-secondary">Готовые конфигурации</h2>
            <p className="text-muted-foreground mb-12 text-lg">Выберите готовую сборку или создайте свою</p>
            <div className="grid md:grid-cols-3 gap-8">
              {prebuiltConfigs.map((config) => (
                <Card key={config.id} className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="p-8">
                    <div className="text-6xl mb-6">{config.image}</div>
                    <h3 className="text-2xl font-bold mb-3 text-secondary">{config.name}</h3>
                    <p className="text-muted-foreground mb-6">{config.description}</p>
                    <div className="space-y-2 mb-6">
                      {config.specs.map((spec, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Icon name="Check" size={16} className="text-primary" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-border">
                      <span className="text-3xl font-bold text-primary">
                        {config.price.toLocaleString('ru-RU')} ₽
                      </span>
                      <Button>
                        <Icon name="ShoppingCart" size={16} className="mr-2" />
                        Купить
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'configurator' && (
        <div className="py-16 px-6 animate-fade-in">
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold mb-4 text-secondary">Конфигуратор ПК</h2>
            <p className="text-muted-foreground mb-12 text-lg">
              Выберите комплектующие и мы проверим их совместимость
            </p>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Tabs defaultValue="cpu" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="cpu">Процессор</TabsTrigger>
                    <TabsTrigger value="gpu">Видеокарта</TabsTrigger>
                    <TabsTrigger value="ram">Память</TabsTrigger>
                    <TabsTrigger value="other">Прочее</TabsTrigger>
                  </TabsList>
                  
                  {['cpu', 'gpu', 'ram'].map((type) => (
                    <TabsContent key={type} value={type} className="space-y-4">
                      {components
                        .filter((c) => c.type === type)
                        .map((component) => (
                          <Card
                            key={component.id}
                            className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                              selectedComponents[component.type]?.id === component.id
                                ? 'border-primary border-2'
                                : ''
                            }`}
                            onClick={() => toggleComponent(component)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-lg mb-1">{component.name}</h4>
                                <div className="flex gap-2 flex-wrap">
                                  {component.socket && (
                                    <Badge variant="outline">{component.socket}</Badge>
                                  )}
                                  {component.ramType && (
                                    <Badge variant="outline">{component.ramType}</Badge>
                                  )}
                                  {component.wattage && (
                                    <Badge variant="outline">{component.wattage}W</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                  {component.price.toLocaleString('ru-RU')} ₽
                                </p>
                                {selectedComponents[component.type]?.id === component.id && (
                                  <Badge className="mt-2">Выбрано</Badge>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                    </TabsContent>
                  ))}
                  
                  <TabsContent value="other" className="space-y-4">
                    {components
                      .filter((c) => ['motherboard', 'storage', 'psu', 'case'].includes(c.type))
                      .map((component) => (
                        <Card
                          key={component.id}
                          className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                            selectedComponents[component.type]?.id === component.id
                              ? 'border-primary border-2'
                              : ''
                          }`}
                          onClick={() => toggleComponent(component)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-lg mb-1">{component.name}</h4>
                              <Badge variant="outline" className="capitalize">
                                {component.type}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">
                                {component.price.toLocaleString('ru-RU')} ₽
                              </p>
                              {selectedComponents[component.type]?.id === component.id && (
                                <Badge className="mt-2">Выбрано</Badge>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="lg:col-span-1">
                <Card className="p-6 sticky top-24">
                  <h3 className="text-xl font-bold mb-4 text-secondary">Ваша сборка</h3>
                  
                  {Object.values(selectedComponents).length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Выберите комплектующие
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {Object.values(selectedComponents).map((comp) => (
                        <div key={comp.id} className="flex justify-between items-start text-sm pb-3 border-b">
                          <div className="flex-1">
                            <p className="font-medium">{comp.name}</p>
                            <Badge variant="outline" className="mt-1 capitalize text-xs">
                              {comp.type}
                            </Badge>
                          </div>
                          <p className="font-semibold whitespace-nowrap ml-4">
                            {comp.price.toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                      ))}
                      
                      {compatibility.warnings.length > 0 && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                          <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                            <Icon name="AlertTriangle" size={18} />
                            Предупреждения
                          </h4>
                          <ul className="space-y-1 text-sm">
                            {compatibility.warnings.map((warning, idx) => (
                              <li key={idx}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {compatibility.compatible && Object.values(selectedComponents).length > 2 && (
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                          <p className="text-primary font-medium flex items-center gap-2">
                            <Icon name="CheckCircle" size={18} />
                            Все комплектующие совместимы!
                          </p>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-semibold">Итого:</span>
                          <span className="text-3xl font-bold text-primary">
                            {getTotalPrice().toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                        <Button
                          className="w-full"
                          disabled={!compatibility.compatible || Object.values(selectedComponents).length === 0}
                          onClick={() => toast.success('Заказ оформлен! Мы свяжемся с вами в ближайшее время')}
                        >
                          <Icon name="ShoppingCart" size={18} className="mr-2" />
                          Оформить заказ
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showCompare} onOpenChange={setShowCompare}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl">Сравнение конфигураций</DialogTitle>
          </DialogHeader>
          
          {comparedConfigs.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="GitCompare" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Выберите конфигурации для сравнения в каталоге</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Параметр</th>
                    {comparedConfigs.map(config => (
                      <th key={config.id} className="py-4 px-4">
                        <div className="text-center">
                          <div className="text-4xl mb-2">{config.image}</div>
                          <div className="text-xl font-bold text-secondary">{config.name}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="py-4 px-4 font-medium">Описание</td>
                    {comparedConfigs.map(config => (
                      <td key={config.id} className="py-4 px-4 text-center text-sm text-muted-foreground">
                        {config.description}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="py-4 px-4 font-medium">Цена</td>
                    {comparedConfigs.map(config => (
                      <td key={config.id} className="py-4 px-4 text-center">
                        <span className="text-2xl font-bold text-primary">
                          {config.price.toLocaleString('ru-RU')} ₽
                        </span>
                      </td>
                    ))}
                  </tr>
                  {[0, 1, 2, 3].map(specIdx => (
                    <tr key={specIdx} className="border-b hover:bg-muted/30">
                      <td className="py-4 px-4 font-medium">
                        {specIdx === 0 && 'Процессор'}
                        {specIdx === 1 && 'Видеокарта'}
                        {specIdx === 2 && 'Память'}
                        {specIdx === 3 && 'Накопитель'}
                      </td>
                      {comparedConfigs.map(config => (
                        <td key={config.id} className="py-4 px-4 text-center">
                          {config.specs[specIdx] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-b">
                    <td className="py-4 px-4 font-medium">Действия</td>
                    {comparedConfigs.map(config => (
                      <td key={config.id} className="py-4 px-4">
                        <div className="flex flex-col gap-2">
                          <Button className="w-full" size="sm">
                            <Icon name="ShoppingCart" size={14} className="mr-2" />
                            Купить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => toggleCompare(config.id)}
                          >
                            <Icon name="X" size={14} className="mr-2" />
                            Удалить
                          </Button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}