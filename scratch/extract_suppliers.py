import os
import xml.etree.ElementTree as ET
import csv
from collections import deque

def extract_supplier_data(root_path):
    suppliers = {}  # cnpj -> data
    
    # Iterate through the NFE xml directory
    for root, dirs, files in os.walk(root_path):
        for file in files:
            if file.endswith('.xml') and not file.startswith('proc'):
                file_path = os.path.join(root, file)
                try:
                    tree = ET.parse(file_path)
                    xml_root = tree.getroot()
                    
                    # Remove namespace for easier access
                    for elem in xml_root.iter():
                        if '}' in elem.tag:
                            elem.tag = elem.tag.split('}', 1)[1]
                    
                    # In an NFE, <emit> is the issuer and <dest> is the recipient.
                    # We'll collect both but distinguish them if needed.
                    # Usually, suppliers are in <emit> when we are the receiver.
                    
                    for tag in ['emit', 'dest']:
                        party = xml_root.find(f'.//{tag}')
                        if party is not None:
                            cnpj = party.findtext('CNPJ') or party.findtext('CPF')
                            if cnpj:
                                name = party.findtext('xNome')
                                fantasy = party.findtext('xFant')
                                
                                address_tag = 'enderEmit' if tag == 'emit' else 'enderDest'
                                addr = party.find(address_tag)
                                
                                street = nro = bairro = mun = uf = cep = ""
                                if addr is not None:
                                    street = addr.findtext('xLgr')
                                    nro = addr.findtext('nro')
                                    bairro = addr.findtext('xBairro')
                                    mun = addr.findtext('xMun')
                                    uf = addr.findtext('UF')
                                    cep = addr.findtext('CEP')
                                
                                if cnpj not in suppliers:
                                    suppliers[cnpj] = {
                                        'CNPJ/CPF': cnpj,
                                        'Nome': name,
                                        'Fantasia': fantasy,
                                        'Logradouro': street,
                                        'Numero': nro,
                                        'Bairro': bairro,
                                        'Municipio': mun,
                                        'UF': uf,
                                        'CEP': cep,
                                        'Tipo': 'Emitente' if tag == 'emit' else 'Destinatario'
                                    }
                except Exception as e:
                    continue # Skip malformed or non-NFE XMLs
                    
    return suppliers

def save_to_csv(data, output_file):
    if not data:
        print("No data found.")
        return
        
    fieldnames = ['CNPJ/CPF', 'Nome', 'Fantasia', 'Logradouro', 'Numero', 'Bairro', 'Municipio', 'UF', 'CEP', 'Tipo']
    with open(output_file, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
        writer.writeheader()
        for row in data.values():
            writer.writerow(row)
    print(f"Saved {len(data)} unique entities to {output_file}")

if __name__ == "__main__":
    nfe_path = r"\\jmfindserver\INCOSYSTEM\NFE\xml"
    output = "fornecedores_extraidos.csv"
    print(f"Scanning {nfe_path}...")
    data = extract_supplier_data(nfe_path)
    save_to_csv(data, output)
