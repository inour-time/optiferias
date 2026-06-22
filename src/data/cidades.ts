const cache = new Map<string, string[]>()

export async function fetchCitiesByState(state: string): Promise<string[]> {
  if (!state) return []

  const key = state.toUpperCase()
  if (cache.has(key)) return cache.get(key)!

  try {
    const data: { nome: string }[] = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${key}/municipios`
    ).then((r) => {
      if (!r.ok) throw new Error('IBGE API error')
      return r.json()
    })

    const cities = data.map((c) => c.nome).sort((a, b) => a.localeCompare(b, 'pt-BR'))
    cache.set(key, cities)
    return cities
  } catch {
    const fallback = FALLBACK_CITIES[key] ?? []
    cache.set(key, fallback)
    return fallback
  }
}

const FALLBACK_CITIES: Record<string, string[]> = {
  AC: ['Cruzeiro do Sul', 'Rio Branco', 'Sena Madureira'],
  AL: ['Arapiraca', 'Maceió', 'Marechal Deodoro', 'Palmeira dos Índios', 'Penedo', 'Rio Largo', 'São Miguel dos Campos', 'União dos Palmares'],
  AM: ['Coari', 'Itacoatiara', 'Manaus', 'Manacapuru', 'Parintins', 'Tefé'],
  AP: ['Macapá', 'Santana'],
  BA: ['Alagoinhas', 'Barreiras', 'Camaçari', 'Feira de Santana', 'Ilhéus', 'Itabuna', 'Jequié', 'Juazeiro', 'Lauro de Freitas', 'Paulo Afonso', 'Porto Seguro', 'Salvador', 'Santo Antônio de Jesus', 'Simões Filho', 'Teixeira de Freitas', 'Vitória da Conquista'],
  CE: ['Caucaia', 'Crato', 'Fortaleza', 'Iguatu', 'Itapipoca', 'Juazeiro do Norte', 'Maracanaú', 'Quixadá', 'Sobral'],
  DF: ['Brasília'],
  ES: ['Aracruz', 'Cachoeiro de Itapemirim', 'Cariacica', 'Colatina', 'Guarapari', 'Linhares', 'São Mateus', 'Serra', 'Vila Velha', 'Vitória'],
  GO: ['Águas Lindas de Goiás', 'Anápolis', 'Aparecida de Goiânia', 'Catalão', 'Goiânia', 'Itumbiara', 'Jataí', 'Luziânia', 'Novo Gama', 'Planaltina', 'Rio Verde', 'Valparaíso de Goiás'],
  MA: ['Açailândia', 'Bacabal', 'Caxias', 'Codó', 'Imperatriz', 'Paço do Lumiar', 'Santa Inês', 'São José de Ribamar', 'São Luís', 'Timon'],
  MG: ['Alfenas', 'Araguari', 'Araxá', 'Barbacena', 'Belo Horizonte', 'Betim', 'Cataguases', 'Conselheiro Lafaiete', 'Contagem', 'Coronel Fabriciano', 'Divinópolis', 'Governador Valadares', 'Ipatinga', 'Itabira', 'Itajubá', 'Ituiutaba', 'Juiz de Fora', 'Lavras', 'Montes Claros', 'Muriaé', 'Nova Lima', 'Nova Serrana', 'Pará de Minas', 'Passos', 'Patos de Minas', 'Patrocínio', 'Poços de Caldas', 'Pouso Alegre', 'Ribeirão das Neves', 'Sabará', 'Santa Luzia', 'São João del Rei', 'São Sebastião do Paraíso', 'Sete Lagoas', 'Teófilo Otoni', 'Ubá', 'Uberaba', 'Uberlândia', 'Unaí', 'Varginha', 'Vespasiano', 'Viçosa'],
  MS: ['Campo Grande', 'Corumbá', 'Dourados', 'Naviraí', 'Nova Andradina', 'Ponta Porã', 'Três Lagoas'],
  MT: ['Cáceres', 'Cuiabá', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Várzea Grande'],
  PA: ['Abaetetuba', 'Altamira', 'Ananindeua', 'Barcarena', 'Belém', 'Bragança', 'Breves', 'Castanhal', 'Itaituba', 'Marabá', 'Paragominas', 'Parauapebas', 'Redenção', 'Santarém', 'Tucuruí'],
  PB: ['Bayeux', 'Campina Grande', 'João Pessoa', 'Patos', 'Santa Rita', 'Sousa'],
  PE: ['Cabo de Santo Agostinho', 'Camaragibe', 'Caruaru', 'Garanhuns', 'Ipojuca', 'Jaboatão dos Guararapes', 'Olinda', 'Paulista', 'Petrolina', 'Recife', 'São Lourenço da Mata', 'Vitória de Santo Antão'],
  PI: ['Campina Grande', 'Campo Maior', 'Floriano', 'Parnaíba', 'Picos', 'Piripiri', 'Teresina'],
  PR: ['Almirante Tamandaré', 'Apucarana', 'Araucária', 'Cambé', 'Campo Largo', 'Cascavel', 'Colombo', 'Curitiba', 'Foz do Iguaçu', 'Francisco Beltrão', 'Guarapuava', 'Londrina', 'Maringá', 'Paranaguá', 'Pinhais', 'Ponta Grossa', 'São José dos Pinhais', 'Toledo', 'Umuarama'],
  RJ: ['Angra dos Reis', 'Araruama', 'Barra Mansa', 'Belford Roxo', 'Cabo Frio', 'Campos dos Goytacazes', 'Duque de Caxias', 'Itaboraí', 'Itaguaí', 'Japeri', 'Macaé', 'Magé', 'Maricá', 'Mesquita', 'Nilópolis', 'Niterói', 'Nova Friburgo', 'Nova Iguaçu', 'Petrópolis', 'Queimados', 'Resende', 'Rio Bonito', 'Rio de Janeiro', 'São Gonçalo', 'São João de Meriti', 'Saquarema', 'Seropédica', 'Teresópolis', 'Três Rios', 'Vassouras', 'Volta Redonda'],
  RN: ['Caicó', 'Ceará-Mirim', 'Macaíba', 'Mossoró', 'Natal', 'Parnamirim', 'São Gonçalo do Amarante'],
  RO: ['Ariquemes', 'Cacoal', 'Ji-Paraná', 'Porto Velho', 'Rolim de Moura', 'Vilhena'],
  RR: ['Boa Vista', 'Rorainópolis'],
  RS: ['Alvorada', 'Bagé', 'Bento Gonçalves', 'Canoas', 'Caxias do Sul', 'Erechim', 'Esteio', 'Gravataí', 'Guaíba', 'Lajeado', 'Novo Hamburgo', 'Passo Fundo', 'Pelotas', 'Porto Alegre', 'Rio Grande', 'Santa Cruz do Sul', 'Santa Maria', 'Santo Ângelo', 'São Leopoldo', 'Sapucaia do Sul', 'Uruguaiana', 'Viamão'],
  SC: ['Balneário Camboriú', 'Blumenau', 'Chapecó', 'Criciúma', 'Florianópolis', 'Itajaí', 'Jaraguá do Sul', 'Joinville', 'Lages', 'Palhoça', 'São José', 'Tubarão'],
  SE: ['Aracaju', 'Estância', 'Itabaiana', 'Lagarto', 'Nossa Senhora do Socorro', 'São Cristóvão'],
  SP: ['Americana', 'Araraquara', 'Araras', 'Assis', 'Atibaia', 'Barretos', 'Barueri', 'Bauru', 'Birigui', 'Botucatu', 'Bragança Paulista', 'Campinas', 'Carapicuíba', 'Catanduva', 'Cotia', 'Diadema', 'Embu das Artes', 'Ferraz de Vasconcelos', 'Franca', 'Francisco Morato', 'Franco da Rocha', 'Guaratinguetá', 'Guarujá', 'Guarulhos', 'Hortolândia', 'Indaiatuba', 'Itapecerica da Serra', 'Itapetininga', 'Itapevi', 'Itaquaquecetuba', 'Jacareí', 'Jandira', 'Jundiaí', 'Limeira', 'Lorena', 'Mauá', 'Mogi das Cruzes', 'Mogi Guaçu', 'Osasco', 'Ourinhos', 'Paulínia', 'Piracicaba', 'Poá', 'Praia Grande', 'Presidente Prudente', 'Ribeirão Pires', 'Ribeirão Preto', 'Rio Claro', 'Salto', 'Santa Bárbara d\'Oeste', 'Santana de Parnaíba', 'Santo André', 'Santos', 'São Bernardo do Campo', 'São Caetano do Sul', 'São Carlos', 'São José do Rio Preto', 'São José dos Campos', 'São Paulo', 'São Vicente', 'Sertãozinho', 'Sorocaba', 'Sumaré', 'Suzano', 'Taboão da Serra', 'Taubaté', 'Valinhos', 'Várzea Paulista', 'Votorantim'],
  TO: ['Araguaína', 'Gurupi', 'Palmas', 'Paraíso do Tocantins', 'Porto Nacional'],
}
