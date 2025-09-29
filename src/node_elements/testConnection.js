import { supabase } from './config.js';
import { EventConnections } from './EventConnections.js';
import { UserConnections } from './UserConnections.js';

const testAll = async () => {
  console.log('🧪 Probando conexión con Supabase...');
  
  // Probar conexión básica directamente
  try {
    const { data, error } = await supabase
      .from('events')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Conexión básica a Supabase: EXITOSA');
  } catch (error) {
    console.log('❌ Error en conexión básica:', error.message);
    return;
  }

  // Probar EventConnections
  try {
    const eventConnections = new EventConnections();
    const events = await eventConnections.getEvents();
    console.log(`✅ EventConnections funciona: ${events ? events.length : 0} eventos`);
    
    if (events && events.length > 0) {
      console.log('📝 Primer evento:', events[0].name);
    }
  } catch (error) {
    console.log('❌ Error en EventConnections:', error.message);
  }

  console.log('🎉 ¡Prueba completada!');
};

testAll();