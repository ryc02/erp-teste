from fastapi import Header

def get_empresa_id(x_empresa_id: str = Header(None, alias="X-Empresa-Id")):
    if x_empresa_id == "all" or not x_empresa_id:
        return None
    return int(x_empresa_id)
