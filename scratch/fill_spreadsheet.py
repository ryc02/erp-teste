import pandas as pd
import os

def update_spreadsheet(csv_path, xls_path, output_path):
    # Read CSV
    csv_df = pd.read_csv(csv_path, sep=';', encoding='utf-8-sig')
    
    # Read existing XLS (headers)
    try:
        xls_df = pd.read_excel(xls_path)
    except Exception as e:
        print(f"Error reading XLS: {e}")
        return

    # Map columns with robustness for special characters
    cols = xls_df.columns.tolist()
    
    def find_col(name):
        for c in cols:
            if name.lower() in c.lower().replace('', ''): # Handle common encoding issues
                return c
        return None

    c_nome = find_col('Nome')
    c_fant = find_col('Fantasia')
    c_end = find_col('Endere')
    c_num = find_col('Nmero') or find_col('Nmer')
    c_bairro = find_col('Bairro')
    c_cep = find_col('CEP')
    c_cidade = find_col('Cidade')
    c_estado = find_col('Estado')
    c_cnpj = find_col('CNPJ')
    c_tipo = find_col('Tipo pessoa')
    c_situ = find_col('Situa')

    new_rows = []
    for _, row in csv_df.iterrows():
        cnpj = str(row['CNPJ/CPF']).strip()
        tipo_pessoa = 'Jurídica' if len(cnpj) > 11 else 'Física'
        
        new_row = {col: None for col in cols}
        if c_nome: new_row[c_nome] = row['Nome']
        if c_fant: new_row[c_fant] = row['Fantasia']
        if c_end: new_row[c_end] = row['Logradouro']
        if c_num: new_row[c_num] = row['Numero']
        if c_bairro: new_row[c_bairro] = row['Bairro']
        if c_cep: new_row[c_cep] = row['CEP']
        if c_cidade: new_row[c_cidade] = row['Municipio']
        if c_estado: new_row[c_estado] = row['UF']
        if c_cnpj: new_row[c_cnpj] = cnpj
        if c_tipo: new_row[c_tipo] = tipo_pessoa
        if c_situ: new_row[c_situ] = 'Ativo'
        
        new_rows.append(new_row)
    
    # Create new dataframe with the data
    new_data_df = pd.DataFrame(new_rows)
    
    # Combine with existing if needed, or just overwrite with the new list
    # The user said "preencha", usually means add.
    updated_df = pd.concat([xls_df, new_data_df], ignore_index=True)
    
    # Save as XLSX because XLS writer is not available
    updated_df.to_excel(output_path, index=False)
    print(f"Updated spreadsheet saved to {output_path}")

if __name__ == "__main__":
    csv_file = r"d:\ERP Venner\scratch\fornecedores_extraidos.csv"
    xls_file = r"C:\Users\rycha\OneDrive\Documents\contatos.xls"
    output_file = r"C:\Users\rycha\OneDrive\Documents\contatos_preenchido.xlsx"
    
    update_spreadsheet(csv_file, xls_file, output_file)
