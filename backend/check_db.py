from sqlalchemy import create_engine, inspect
engine = create_engine('sqlite:///erp_venner.db')
inspector = inspect(engine)
print(inspector.get_columns('pedidos_venda'))
